"use strict";

const Path = require("path");
const Fs = require("fs");
const Env = require("./env.js");
const Status = require("./status.js");
const Engine262 = require(Path.join(Env.ENGINE262, "dist", "engine262.js"));
const Test262Realm = require("./test262-realm");

let features = Path.join(Env.ENGINE262, "test", "test262", "features");
features = Fs.readFileSync(features, "utf8");
features = features.split("\n");
features = features.filter((line) => line !== "");
features = features.filter((line) => !line.startsWith("#"));
features = features.filter((line) => !line.startsWith("-"));
features = features.filter((line) => line.includes("="));
features = features.map((line) => line.split("=").map((word) => word.trim()));

const cache = {__proto__:null};

const identity = (any) => any;

module.exports = (test, kind, instrumenter) => {
  const specifier = Path.resolve(Env.TEST262, test.path);
  const includes = ["assert.js", "sta.js"].concat(test.attributes.includes);
  if (test.attributes.flags.async) {
    includes.unshift("doneprintHandle.js");
  }
  Engine262.setSurroundingAgent(new Engine262.Agent({
    features: test.attributes.features ? test.attributes.features.flatMap((feature) => {
      return (feature in features) ? [feature, features[feature]] : [feature];
    }) : []
  }));
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
    promises,
    success: () => {
      if (asynchronous === global.undefined) {
        asynchronous = null;
      } else {
        asynchronous = {
          status: Status.ASYNC_DUPLICATE,
          head: null,
          tail: asynchronous
        };
      }
    },
    failure: (message) => {
      if (asynchronous === global.undefined) {
        asynchronous = {
          status: Status.ASYNC_FAILURE,
          message
        };
      } else {
        asynchronous = {
          status: Status.ASYNC_DUPLICATE,
          head: {
            status: Status.ASYNC_FAILURE,
            message
          },
          tail: asynchronous
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
  const failure = realm.scope(() => {
    let completion;
    // Include //
    for (const include of includes) {
      if (!(include in cache)) {
        cache[include] = Fs.readFileSync(Path.join(Env.TEST262, "harness", include), "utf8");
      }
      // No harness file declares let/const/class variables.
      // So they do not polute the global declarative record.
      // Hence they do not need to be instrumented.
      completion = realm.evaluateScript(cache[include], {
        specifier: Path.join(Env.TEST262, "harness", include)
      });
      if (completion instanceof Engine262.AbruptCompletion) {
        return {
          status: Status.INCLUDE_FAILURE,
          completion: Engine262.inspect(completion),
          include: include
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
          completion: Engine262.inspect(completion)
        };
      }
      return {
        status: Status.CONTENT_FAILURE,
        completion: Engine262.inspect(completion)
      };
    }
    // Teardown //
    if (test.attributes.flags.async) {
      if (asynchronous === global.undefined) {
        return {satus: Status.ASYNC_MISSING};
      }
      return asynchronous;
    } else {
      if (asynchronous !== global.undefined) {
        return {status:Status.ASYNC_PRESENT};
      }
    }
    if (test.attributes.negative) {
      return {status: Status.MISSING_NEGATIVE};
    }
    return null;
  });
  if (failure === null && promises.size > 0) {
    return {
      status: Status.PROMISE_PENDING,
      promises: Array.from(promises.values()).map((promise) => Engine262.inspect(promise))
    };
  }
  return failure;
};
