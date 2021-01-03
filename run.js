"use strict";

const Path = require("path");
const Fs = require("fs");
const Status = require("./status.js");
const Engine262 = require(Path.join(__dirname, "node_modules", "@engine262", "engine262", "dist", "engine262.js"));
const Test262Realm = require("./test262-realm");

const features = new global.Map();
{
  const path = Path.join(__dirname, "features.txt");
  const content = Fs.readFileSync(path, "utf8");
  let lines = content.split("\n");
  lines = lines.filter((line) => line !== "");
  lines = lines.filter((line) => !line.startsWith("#"));
  lines.forEach((line) => {
    if (line.startsWith("-")) {
      features.set(line.substring(1).trim(), null);
    } else {
      const words = line.split("=");
      features.set(words[0].trim(), words[1].trim());
    }
  });
}

const cache = {__proto__:null};

const identity = (any) => any;

module.exports = (specifier, test, kind, instrumenter) => {
  const includes = ["assert.js", "sta.js"].concat(test.attributes.includes);
  if (test.attributes.flags.async) {
    includes.unshift("doneprintHandle.js");
  }
  if (test.attributes.features) {
    const array = ([]).concat(test.attributes.features);
    for (let feature of test.attributes.features) {
      if (features.has(feature)) {
        if (features.get(feature) === null) {
          return {
            status: Status.DISABLED_FEATURE,
            data: feature,
            completion: null
          };
        } else {
          array.push(features.get(feature));
        }
      }
    }
    Engine262.setSurroundingAgent(new Engine262.Agent({features:array}));
  } else {
    Engine262.setSurroundingAgent(new Engine262.Agent({features:[]}));
  }
  const instrument = instrumenter();
  // if (dump) {
  //   let counter = 0;
  //   const basename = Path.join(__dirname, "dump");
  //   for (let filename of Fs.readdirSync(basename)) {
  //     Fs.unlinkSync(Path.join(basename, filename));
  //   }
  //   const instrument = agent.instrument;
  //   const wrap = (source) => (code, ...args) => {
  //     counter++;
  //     let id = global.String(counter);
  //     while (id.length < 4) {
  //       id = "0" + id;
  //     }
  //     const header = `/* ${global.JSON.stringify(args)} */`;
  //     Fs.writeFileSync(Path.join(basename, `${id}-${source}.js`), `${header}${code}`, "utf8");
  //     code = instrument[source](code, ...args);
  //     Fs.writeFileSync(Path.join(basename, `${id}-${source}*.js`), `${header}${code}`, "utf8");
  //     return code;
  //   }
  //   agent = {
  //     setup: agent.setup,
  //     enclave: agent.enclave,
  //     instrument: {
  //       module: wrap("module"),
  //       script: wrap("script"),
  //       eval: wrap("eval")
  //     }
  //   };
  // }
  const promises = new Set();
  const modules = new Map();
  let asynchronous = global.undefined;
  const realm = Test262Realm({
    instrument: kind === "exclusive" ? {
      setup: instrument.setup,
      script: identity,
      module: identity,
      eval: instrument.eval
    } : instrument,
    modules,
    promises,
    success: () => {
      if (asynchronous === global.undefined) {
        asynchronous = null;
      } else {
        asynchronous = {
          status: Status.ASYNC_DUPLICATE,
          data: null,
          completion: null
        };
      }
    },
    failure: (message) => {
      if (asynchronous === global.undefined) {
        asynchronous = {
          status: Status.ASYNC_FAILURE,
          data: message,
          completion: null
        };
      } else {
        asynchronous = {
          status: Status.ASYNC_DUPLICATE,
          data: null,
          completion: null
        };
      }
    }
  });
  // let counter = 0;
  // instrument = (((old) => (code, source, serial, specifier) => (
  //   console.log("instrumenting", ++counter, specifier, source, serial),
  //   Fs.writeFileSync(Path.join(__dirname, "dump", `${counter}-original.js`), code, "utf8"),
  //   code = old(code, source, serial),
  //   Fs.writeFileSync(Path.join(__dirname, "dump", `${counter}-instrumented.js`), code, "utf8"),
  //   code)) (instrument));
  return realm.scope(() => {
    let completion;
    // Include //
    for (const include of includes) {
      if (!(include in cache)) {
        cache[include] = Fs.readFileSync(Path.join(__dirname, "test262", "harness", include), "utf8");
      }
      // No harness file declares let/const/class variables.
      // So they do not polute the global declarative record.
      // Hence they do not need to be instrumented.
      completion = realm.evaluateScript(cache[include], {
        specifier: Path.join(__dirname, "test262", "harness", include)
      });
      if (completion instanceof Engine262.AbruptCompletion) {
        return {
          status: Status.HARNESS_FAILURE,
          data: include,
          completion: Engine262.inspect(completion)
        };
      }
    }
    // Content //
    if (test.mode === "module") {
      try {
        completion = realm.createSourceTextModule(specifier, instrument.module(test.content, specifier));
      } catch (error) {
        if (error instanceof SyntaxError) {
          completion = Engine262.Throw("SyntaxError", "Raw", error.message);
        }
        throw error;
      }
      if (!(completion instanceof Engine262.AbruptCompletion)) {
        const module = completion;
        modules.set(specifier, module);
        completion = module.Link();
        if (!(completion instanceof Engine262.AbruptCompletion)) {
          completion = module.Evaluate();
        }
        if (!(completion instanceof Engine262.AbruptCompletion)) {
          if (completion.PromiseState === "rejected") {
            completion = Engine262.Throw(completion.PromiseResult);
          }
        }
      }
    } else {
      try {
        completion = realm.evaluateScript(instrument.script(test.content, specifier), {specifier});
      } catch (error) {
        if (error instanceof SyntaxError) {
          completion = syntax_error_throw_completion(error.message);
        }
        throw error;
      }
    }
    if (completion instanceof Engine262.AbruptCompletion) {
      if (test.attributes.negative) {
        const error = completion.Value;
        if (Engine262.Type(error) === "Object") {
          let prototype = error.Prototype;
          if (Engine262.Type(prototype) === "Object") {
            const descriptor = error.Prototype.properties.get(new Engine262.Value("constructor"));
            if (descriptor && Engine262.IsDataDescriptor(descriptor)) {
              const constructor = descriptor.Value;
              if (Engine262.Type(constructor) === "Object" && Engine.IsCallable(constructor) === Engine262.Value.true) {
                const descriptor = constructor.properties.get(new Engine262.Value("name"));
                if (descriptor && Engine262.IsDataDescriptor(descriptor)) {
                  const name = descriptor.Value;
                  if (Engine262.Type(name) === "string" && name.stringValue() === test.attributes.negative.type) {
                    return null;
                  }
                }
              }
            }
          }
        }
        return {
          status: Status.WRONG_NEGATIVE,
          data: null,
          completion: Engine262.inspect(completion)
        };
      }
      return {
        status: Status.CONTENT_FAILURE,
        data: null,
        completion: Engine262.inspect(completion)
      };
    }
    // Teardown //
    if (test.attributes.flags.async) {
      if (asynchronous === global.undefined) {
        return {
          satus: Status.ASYNC_MISSING,
          completion: null,
          data: null
        };
      }
      return asynchronous;
    } else {
      if (asynchronous !== global.undefined) {
        return {
          status:Status.ASYNC_PRESENT,
          data: null,
          completion: null
        };
      }
    }
    if (test.attributes.negative) {
      return {
        status: Status.MISSING_NEGATIVE,
        data: null,
        completion: null
      };
    }
    if (promises.size > 0) {
      return {
        status: Status.PROMISE_PENDING,
        data: Array.from(promises.values()).map((promise) => Engine262.inspect(promise)).join(", "),
        completion: null
      };
    }
    return null;
  });
};
