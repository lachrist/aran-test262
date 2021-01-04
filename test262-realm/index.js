"use strict";

const Path = require("path");
const Fs = require("fs");
const Engine262 = require(Path.join("..", "node_modules", "@engine262", "engine262", "dist", "engine262.js"));

const identity = (any) => any;
const success = () => { throw new global.Error(`Unhandled asynchronous test success`); }
const failure = (message) => { throw new global.Error(`Unhandled asynchronous test failure: ${message}`); }

module.exports = (options) => {
  options = global.Object.assign({
    instrument: {
      setup: null,
      script: identity,
      module: identity,
      eval: identity
    },
    success,
    failure,
    modules: new Map(),
    promises: new Set()
  }, options);
  const realm = new Engine262.ManagedRealm({
    promiseRejectionTracker: (promise, operation) => {
      if (operation === "reject") {
        options.promises.add(promise);
      } else if (operation === "handle") {
        options.promises.delete(promise);
      } else {
        throw new RangeError("promiseRejectionTracker", operation);
      }
    },
    resolveImportedModule: (referencing, specifier) => {
      const basename = Path.dirname(referencing.HostDefined.specifier);
      const filename = Path.resolve(basename, specifier);
      if (!options.modules.has(filename)) {
        let code;
        try {
          code = Fs.readFileSync(filename, "utf8");
        } catch (error) {
          return Engine262.Throw(error.name, "Raw", error.message);
        }
        try {
          code = options.instrument.module(code, filename);
        } catch (error) {
          if (error instanceof global.SyntaxError) {
            return Engine262.Throw("SyntaxError", "Raw", error.message);
          }
          throw error;
        }
        const module = realm.createSourceTextModule(filename, code);
        options.modules.set(filename, module);
      }
      return options.modules.get(filename);
    }
  });
  return realm.scope(() => {
    realm.GlobalObject.DefineOwnProperty(new Engine262.Value("print"), Engine262.Descriptor({
      Value: new Engine262.Value((args) => {
        if (args.length > 0 && Engine262.Type(args[0]) === "String") {
          if (args[0].stringValue() === "Test262:AsyncTestComplete") {
            options.success();
          } else if (args[0].stringValue().startsWith("Test262:AsyncTestFailure:")) {
            options.failure(args[0].stringValue());
          } else {
            console.log(...args.map((arg) => Engine262.inspect(arg)));
          }
        } else {
          console.log(...args.map((arg) => Engine262.inspect(arg)));
        }
        return Engine262.Value.undefined;
      }),
      Writable: Engine262.Value.true,
      Enumerable: Engine262.Value.false,
      Configurable: Engine262.Value.true
    }));
    const $262 = Engine262.OrdinaryObjectCreate(realm.Intrinsics["%Object.prototype%"]);
    realm.GlobalObject.DefineOwnProperty(new Engine262.Value("$262"), Engine262.Descriptor({
      Value: $262,
      Writable: Engine262.Value.true,
      Enumerable: Engine262.Value.false,
      Configurable: Engine262.Value.true
    }));
    Engine262.CreateDataProperty($262, new Engine262.Value("createRealm"), new Engine262.Value(() => module.exports({
      instrument: options.instrument,
      promises: options.promises,
      success,
      failure
    }).GlobalObject.Get(new Engine262.Value("$262"))));
    Engine262.CreateDataProperty($262, new Engine262.Value("detachArrayBuffer"), new Engine262.Value(([arrayBuffer]) => {
      return Engine262.DetachArrayBuffer(arrayBuffer);
    }));
    Engine262.CreateDataProperty($262, new Engine262.Value("evalScript"), new Engine262.Value((args) => {
      if (args.length !== 1 && args.length !== 2) {
        return Engine262.Throw("TypeError", "Raw", "$262.evalScript(code [, specifier]) expects exactly one or two arguments");
      }
      if (Engine262.Type(args[0]) !== "String") {
        return Engine262.Throw("TypeError", "Raw", "$262.evalScript(code [, specifier]) should receive a string as first argument");
      }
      if (args.length > 1 && Engine262.Type(args[1]) !== "String") {
        return Engine262.Throw("TypeError", "Raw", "$262.evalScript(code [, specifier]) should receive a string as second argument (if provided)");
      }
      let code = args[0].stringValue();
      const specifier = args.length > 1 ? args[1].stringValue() : "anonymous-script";
      try {
        code = options.instrument.script(code, specifier);
      } catch (error) {
        if (error instanceof global.SyntaxError) {
          return Engine262.Throw("SyntaxError", "Raw", error.message);
        }
        throw error;
      }
      return realm.evaluateScript(code, {specifier});
    }));
    Engine262.CreateDataProperty($262, new Engine262.Value("gc"), new Engine262.Value(() => {
      Engine262.gc();
      return Engine262.Value.undefined;
    }));
    Engine262.CreateDataProperty($262, new Engine262.Value("global"), realm.GlobalObject);
    $262.DefineOwnProperty(new Engine262.Value("agent"), Engine262.Descriptor({
      __proto__: null,
      Get: new Engine262.Value(() => {
        return Engine262.Throw("Error", "Raw", `$262.agent is not implemented (get)`);
      }),
      Set: new Engine262.Value(() => {
        return Engine262.Throw("Error", "Raw", `$262.agent is not implemented (set)`);
      }),
      Enumerable: Engine262.Value.true,
      Configurable: Engine262.Value.false
    }));
    Engine262.CreateDataProperty($262, new Engine262.Value("instrument"), new Engine262.Value((args) => {
      if (args.length !== 2 && args.length !== 3) {
        return Engine262.Throw("TypeError", "Raw", "$262.instrument(code, location [, specifier]) expects exacly two or three arguments");
      }
      if (Engine262.Type(args[0]) !== "String") {
        return Engine262.Throw("TypeError", "Raw", "$262.instrument(code, location, [, specifier]) should receive a string as first argument");
      }
      if (args[1] !== Engine262.Value.null && Engine262.Type(args[1]) !== "Number") {
        return Engine262.Throw("TypeError", "Raw", "$262.instrument(code, location, [, specifier]) should receive null or a number as second argument");
      }
      if (args.length > 2 && Engine262.Type(args[2]) !== "String") {
        return Engine262.Throw("TypeError", "Raw", "$262.instrument(code, location, [, specifier]) should receive a string as third argument (if provided)");
      }
      let code = args[0].stringValue();
      const location = (args[1] === Engine262.Value.null) ? null : args[1].numberValue();
      const specifier = (args.length > 2) ? args[2].stringValue() : "anonymous-eval";
      try {
        code = options.instrument.eval(code, location, specifier);
      } catch (error) {
        if (error instanceof global.SyntaxError) {
          return Engine262.Throw("SyntaxError", "Raw", error.message);
        }
        throw error;
      }
      return new Engine262.Value(code);
    }));
    if (options.instrument.setup !== null) {
      const completion = realm.evaluateScript(options.instrument.setup, {specifier:"setup.js"});
      if (completion instanceof Engine262.AbruptCompletion) {
        throw new global.Error(`Setup failure: ${Engine262.inspect(completion)}`);
      }
    }
    return realm;
  });
};
