"use strict";

const Path = require("path");
const Fs = require("fs");
const Env = require("./env.js");
const Status = require("./status.js");

const Engine262 = require(Path.join(Env.ENGINE262, "dist", "engine262.js"));
const Engine262Test262Realm = require(Path.join(Env.ENGINE262, "bin", "test262_realm.js"));

const PRELUDE = Fs.readFileSync(Path.join(__dirname, "prelude.js"), "utf8");

const feature_map = Object.fromEntries(Fs
  .readFileSync(
    Path.join(Env.ENGINE262, "test", "test262", "features"), "utf8")
  .split("\n")
  .filter((line) => line !== "")
  .filter((line) => !line.startsWith("#"))
  .filter((line) => !line.startsWith("-"))
  .filter((line) => line.includes("="))
  .map((line) => line.split("=").map((word) => word.trim())));

const isError = (type, value) => {
  if (Engine262.Type(value) !== "Object")
    return false;
  const proto = value.Prototype;
  if (!proto || Engine262.Type(proto) !== "Object")
    return false;
  const ctorDesc = proto.properties.get(new Engine262.Value("constructor"));
  if (!ctorDesc || !Engine262.IsDataDescriptor(ctorDesc))
    return false;
  const ctor = ctorDesc.Value;
  if (Engine262.Type(ctor) !== "Object" || Engine262.IsCallable(ctor) !== Engine262.Value.true)
    return false;
  const namePropDesc = ctor.properties.get(new Engine262.Value("name"));
  if (!namePropDesc || !Engine262.IsDataDescriptor(namePropDesc))
    return false;
  const nameProp = namePropDesc.Value;
  return Engine262.Type(nameProp) === "String" && nameProp.stringValue() === type;
};

const cache = {__proto__:null};

module.exports = (test, agent) => {

  const includes = [].concat(test.attributes.includes);
  includes.unshift("assert.js", "sta.js");

  if (test.attributes.flags.async) {
    includes.unshift("doneprintHandle.js");
  }

  Engine262.setSurroundingAgent(
    new Engine262.Agent(
      {
        features: (
          test.attributes.features ?
          test.attributes.features.flatMap(
            (feature) => (
              feature in feature_map ?
              [feature, feature_map[feature]] :
              [feature])) :
            [])}));

  const test262realm = Engine262Test262Realm.createRealm();

  let {setup, instrument} = agent();

  let counter = 0;

  // instrument = (((old) => (code, source, serial, specifier) => (
  //   console.log("instrumenting", ++counter, specifier, source, serial),
  //   Fs.writeFileSync(Path.join(__dirname, "dump", `${counter}-original.js`), code, "utf8"),
  //   code = old(code, source, serial),
  //   Fs.writeFileSync(Path.join(__dirname, "dump", `${counter}-instrumented.js`), code, "utf8"),
  //   code)) (instrument));

  Engine262.CreateDataProperty(
    test262realm.$262,
    new Engine262.Value("__instrument__"),
    new Engine262.CreateBuiltinFunction(
      ([code, source, location, specifier]) => new Engine262.Value(
        instrument(
          code.stringValue(),
          source.stringValue(),
          (
            location === Engine262.Value.null ?
            null :
            location.numberValue()),
          specifier.stringValue())),
      [],
      test262realm.realm,
      test262realm.realm.Intrinsics['%Function.prototype%'],
      Engine262.Value.false));

  return test262realm.realm.scope(() => {

    {
      // Fs.writeFileSync(Path.join(__dirname, "dump", `setup.js`), setup, "utf8")
      const completion = test262realm.realm.evaluateScript(setup, {specifier:"setup.js"});
      if (completion instanceof Engine262.AbruptCompletion) {
        return {
          status: Status.SETUP_FAILURE,
          completion: Engine262.inspect(completion),
        };
      }
    }

    for (const include of includes) {
      if (!(include in cache)) {
        cache[include] = Fs.readFileSync(Path.join(Env.TEST262, "harness", include), "utf8");
      }
      // No harness file declares let/const/class variables.
      // So they do not polute the global declarative record.
      // Hence they do not need to be instrumented.
      const completion = test262realm.realm.evaluateScript(cache[include], {
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

    {
      // Prelude does not populate the global declarative record.
      // Hence they do not need to be instrumented.
      const completion = test262realm.realm.evaluateScript(PRELUDE);
      if (completion instanceof Engine262.AbruptCompletion) {
        return {
          status: Status.PRELUDE_FAILURE,
          completion: Engine262.inspect(completion)
        };
      }
    }

    let async_result = global.undefined;

    if (test.attributes.flags.async) {
      test262realm.setPrintHandle((m) => {
        if (m.stringValue && m.stringValue() === "Test262:AsyncTestComplete") {
          async_result = null;
        } else {
          async_result = {
            status: Status.ASYNC_PRINT,
            message: m.stringValue ? m.stringValue() : Engine262.inspect(m)
          };
        }
        test262realm.setPrintHandle(undefined);
      });
    }

    {
      const specifier = Path.resolve(Env.TEST262, test.path);
      let completion;
      if (test.mode === "module") {
        completion = test262realm.realm.createSourceTextModule(specifier, instrument(test.content, "module", null, specifier));
        if (!(completion instanceof Engine262.AbruptCompletion)) {
          const module = completion;
          test262realm.resolverCache.set(specifier, module);
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
        completion = test262realm.realm.evaluateScript(instrument(test.content, "script", null, specifier), {specifier});
      }
      if (completion instanceof Engine262.AbruptCompletion) {
        if (test.attributes.negative && isError(test.attributes.negative.type, completion.Value)) {
          return null;
        }
        return {
          status: Status.CONTENT_FAILURE,
          completion: Engine262.inspect(completion)
        };
      }
    }

    if (test.attributes.flags.async) {
      if (async_result === global.undefined) {
        return {satus: Status.ASYNC_MISSING};
      }
      return async_result;
    }

    if (test262realm.trackedPromises.length > 0) {
      return {
        status: Status.PENDING_PROMISE,
        promise: Engine262.inspect(test262realm.trackedPromises[0])
      };
    }

    if (test.attributes.negative) {
      return {status: Status.NEGATIVE_FAILURE};
    }

    return null;

  });

};
