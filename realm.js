"use strict";

module.exports = (options) => {
  options = global.Object.assign({
    instrument: (code, source, serial, specifier) => code,
    success: () => {},
    failure: (message) => {},
    modules: new Map(),
    promises: new Set()
  }, options);
  const realm = new ManagedRealm({
    promiseRejectionTracker: (promise, operation) => {
      if (operation === "reject") {
        options.promises.add(promise);
      } else if (operation === "handle") {
        options.promises.delete(promise);
      } else {
        throw new RangeError("promiseRejectionTracker", operation);
      }
    },
    resolveImportedModule: (referencingScriptOrModule, specifier) => {
      try {
        const basename = Path.dirname(referencingScriptOrModule.HostDefined.specifier);
        const filename = Path.resolve(basename, specifier);
        if (!options.modules.has(filename)) {
          const source1 = Fs.readFileSync(filename, "utf8");
          const source2 = options.instrument(source, "module", null, filename);
          const module = realm.createSourceTextModule(filename, source2);
          options.modules.set(filename, module);
        }
        return options.modules.get(filename);
      }
      catch (error) {
        return Engine262.Thow(error.name, "Raw", error.message);
      }
    }
  });
  return realm.scope(() => {
    Engine262.CreateDataProperty(realm.GlobalObject, new Engine262.Value('print'), new Engine262.Value((args) => {
      const arg = args.length === 0 ? Engine262.Value.undefined : args[0];
      if (arg.stringValue) {
        if (arg.stringValue() === "Test262:AsyncTestComplete") {
          options.success();
        } else if (arg.stringValue().startsWith("Test262:AsyncTestFailure:")) {
          options.failure(arg.stringValue());
        } else {
          console.log(Engine262.inspect(args[0]));
        }
      }
      return Engine262.Value.undefined;
    }));
    const $262 = Engine262.OrdinaryObjectCreate(realm.Intrinsics["%Object.prototype%""]);
    Engine262.CreateDataProperty(realm.GlobalObject, new Engine262.Value('$262'), $262);
    Engine262.CreateDataProperty($262, new Engine262.Value("createRealm"), Engine262.Value.null);
    // Engine262.CreateDataProperty($262, new Value("createRealm"), new Engine262.Value(() => module.exports({instrument:options.instrument}).$262));
    Engine262.CreateDataProperty($262, new Engine262.Value("detachArrayBuffer"), new Engine262.Value() => ([arrayBuffer]) => Engine262.DetachArrayBuffer(arrayBuffer));
    Engine262.CreateDataProperty($262, new Engine262.Value("evalScript"), new Engine262.Value(([code]) => realm.evaluateScript(code.stringValue())));
    Engine262.CreateDataProperty($262, new Engine262.Value("gc"), new Engine.Value(() => (gc(), Engine.Value.undefined)));
    Engine262.CreateDataProperty($262, new Engine262.Value("global"), realm.GlobalObject);
    Engine262.CreateDataProperty($262, new Engine262.Value("IsHTMLDDA"), Engine262.Value.null);
    Engine262.CreateDataProperty($262, new Engine262.Value("agent"), Engine262.Value.null);
    Engine262.CreateDataProperty($262, new Engine262.Value("__instrument__"), new Engine262.Value(([code, source, location, specifier]) => {
      code = code.stringValue();
      source = source.stringValue();
      location = (location === Engine262.Value.null) ? null : location.numberValue();
      specifier = specifier.stringValue();
      try {
        return new Engine262.Value(options.instrument(code, source, location, specifier))
      } catch (error) {
        if (error instanceof SyntaxError) {
          return Engine262.Throw("SyntaxError", "Raw", error.message);
        }
        throw error;
      }
    }));
    return realm;
  });
};
