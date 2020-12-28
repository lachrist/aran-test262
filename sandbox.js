"use strict";

const Vm = require("vm");
const Util = require("util");
const Fs = require("fs");
const Minimist = require("minimist")
const Engine262 = require("./node_modules/@engine262/engine262/dist/engine262.js");

const argv = Minimist(process.argv.slice(2));
const setup = Fs.readFileSync(argv.setup, "utf8");
const body = Fs.readFileSync(argv.body, "utf8");

if (argv.engine262) {

  Engine262.setSurroundingAgent(new Engine262.Agent({}));
  // const cache =
  const realm = new Engine262.ManagedRealm({
    // promiseRejectionTracker() {},
    resolveImportedModule: (referencingScriptOrModule, specifier) => {
      try {
        const base = path.dirname(referencingScriptOrModule.HostDefined.specifier);
        const resolved = path.resolve(base, specifier);
        // if (resolverCache.has(resolved)) {
        //   return resolverCache.get(resolved);
        // }
        const source = fs.readFileSync(resolved, 'utf8');
        const m = realm.createSourceTextModule(resolved, source);
        resolverCache.set(resolved, m);
        return m;
      } catch (error) {
        return Engine262.Throw(error.name, 'Raw', error.message);
      }
    },
    // getImportMetaProperties() {},
    // finalizeImportMeta() {},
    // randomSeed() {},
  });
  // const test262realm = Engine262Test262Realm.createRealm();
  test262realm.realm.scope(() => {
    let completion = null;
    Engine262.CreateDataProperty(realm.GlobalObject, new Value('print'), new Value((args) => {
      console.log(...args.map((arg) => Engine262.inspect(arg)));
      return Engine262.Value.undefined;
    }));
    completion = realm.evaluateScript(setup, {specifier:argv.setup});
    console.log(Engine262.inspect(completion));
    if (argv.module) {
      completion = realm.createSourceTextModule(argv.body, body);
      if (!(completion instanceof Engine262.AbruptCompletion)) {
        const module = completion;
        // realm.resolverCache.set(argv.body, module);
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
      completion = realm.evaluateScript(body, {specifier:argv.body});
    }
    console.log(Engine262.inspect(completion));
  });
}

if (argv.node) {
  const context = Vm.createContext({
    util: (...args) => {
      console.log(...args.map((arg) => Util.inspect(arg)));
      return undefined;
    }
  });
  Vm.runInContext(setup, context, {filename:argv.setup});
  if (argv.module) {
    ((async () => {
      const module = new vm.SourceTextModule(body, {identifier:argv.body});
      await module.link(() => {});
      await module.evaluate();
      console.log("done");
    }) ());
  } else {
    Vm.runInContext(body, context, {filename:argv.body});
    console.log("done");
  }
}
