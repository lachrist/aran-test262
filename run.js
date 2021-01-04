"use strict";
global.Error.stackTraceLimit = 1/0;

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

module.exports = (test, kind, instrumenter) => {
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
    if (test.source === "module") {
      try {
        completion = realm.createSourceTextModule(test.path, instrument.module(test.content, test.path));
      } catch (error) {
        if (error instanceof SyntaxError) {
          completion = Engine262.Throw("SyntaxError", "Raw", error.message);
        } else {
          throw error;
        }
      }
      if (!(completion instanceof Engine262.AbruptCompletion)) {
        const module = completion;
        modules.set(test.path, module);
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
        completion = realm.evaluateScript(instrument.script(test.content, test.path), {specifier:test.path});
      } catch (error) {
        if (error instanceof SyntaxError) {
          completion = Engine262.Throw("SyntaxError", "Raw", error.message);
        } else {
          throw error;
        }
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
              if (Engine262.Type(constructor) === "Object" && Engine262.IsCallable(constructor) === Engine262.Value.true) {
                const descriptor = constructor.properties.get(new Engine262.Value("name"));
                if (descriptor && Engine262.IsDataDescriptor(descriptor)) {
                  const name = descriptor.Value;
                  if (Engine262.Type(name) === "String" && name.stringValue() === test.attributes.negative.type) {
                    return null;
                  }
                }
              }
            }
          }
        }
        return {
          status: Status.NEGATIVE_UNEXPECTED,
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
    // Unhandled promise rejection should not fail the test:
    // https://www.ecma-international.org/ecma-262/#sec-host-promise-rejection-tracker
    //
    // if (promises.size > 0) {
    //   return {
    //     status: Status.PROMISE_PENDING,
    //     data: Array.from(promises.values()).map((promise) => Engine262.inspect(promise)).join(", "),
    //     completion: null
    //   };
    // }
    return null;
  });
};
