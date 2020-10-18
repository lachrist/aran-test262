"use strict";

const Path = require("path");
const Fs = require("fs");
const Env = require("./env.js")

const Engine262 = require(Path.join(Env.ENGINE262, "dist", "engine262.js"));
const Engine262Test262Realm = require(Path.join(Env.ENGINE262, "bin", "test262_realm.js"));

const PRELUDE = `\
var Test262Error = class Test262Error extends Error {};
Test262Error.thrower = (...args) => {
  throw new Test262Error(...args);
};

function $DONE(error) {
  if (error) {
    if (typeof error === "object" && error !== null && "stack" in error) {
      __consolePrintHandle__("Test262:AsyncTestFailure:" + error.stack);
    } else {
      __consolePrintHandle__("Test262:AsyncTestFailure:Test262Error: " + error);
    }
  } else {
    __consolePrintHandle__("Test262:AsyncTestComplete");
  }
}`;

const featureMap = Object.fromEntries(Fs
  .readFileSync(
    Path.join(Env.ENGINE262, "test", "test262", "features"), "utf8")
  .split("\n")
  .filter((line) => line !== "")
  .filter((line) => !line.startsWith("#"))
  .filter((line) => !line.startsWith("-"))
  .filter((line) => line.includes("="))
  .map((line) => line.split("=").map((word) => word.trim())));

const isError = (type, value) => {
  if (Engine262.Type(value) !== "Object") {
    return false;
  }
  const proto = value.Prototype;
  if (!proto || Engine262.Type(proto) !== "Object") {
    return false;
  }
  const ctorDesc = proto.properties.get(new Engine262.Value("constructor"));
  if (!ctorDesc || !Engine262.IsDataDescriptor(ctorDesc)) {
    return false;
  }
  const ctor = ctorDesc.Value;
  if (Engine262.Type(ctor) !== "Object" || Engine262.IsCallable(ctor) !== Engine262.Value.true) {
    return false;
  }
  const namePropDesc = ctor.properties.get(new Engine262.Value("name"));
  if (!namePropDesc || !Engine262.IsDataDescriptor(namePropDesc)) {
    return false;
  }
  const nameProp = namePropDesc.Value;
  return Engine262.Type(nameProp) === "String" && nameProp.stringValue() === type;
};

const includeCache = {};

module.exports = (test, escape) => {

  const agent = new Engine262.Agent(
    {
      features: (
        test.attrs.features ?
        test.attrs.features.flatMap(
          (feature) => feature in featureMap ? [feature, featureMap[feature]] : [feature]) :
        [])});

  Engine262.setSurroundingAgent(agent);

  // {file:test.file}
  const test262realm = Engine262Test262Realm.createRealm();

  // engine262.js:142527
  // function CreateBuiltinFunction(steps, internalSlotsList, realm, prototype, isConstructor = Value.false) {

  if (escape === "function") {
    Engine262.CreateDataProperty(
      test262realm.$262,
      new Engine262.Value(Env.ESCAPE_IDENTIFIER),
      new Engine262.CreateBuiltinFunction(escape, [], test262realm.realm));
  }

  return test262realm.realm.scope(() => {

    test.attrs.includes.unshift("assert.js", "sta.js");

    if (test.attrs.flags.async) {
      test.attrs.includes.unshift("doneprintHandle.js");
    }

    for (const include of test.attrs.includes) {
      if (includeCache[include] === undefined) {
        const p = Path.join(Env.TEST262, "harness", include);
        includeCache[include] = {
          source: Fs.readFileSync(p, "utf8"),
          specifier: p,
        };
      }
      const entry = includeCache[include];
      const completion = test262realm.realm.evaluateScript(entry.source, { specifier: entry.specifier });
      if (completion instanceof Engine262.AbruptCompletion) {
        return { status: "FAIL", error: Engine262.inspect(completion) };
      }
    }

    {
      const completion = test262realm.realm.evaluateScript(PRELUDE);
      if (completion instanceof Engine262.AbruptCompletion) {
        return { status: "FAIL", error: Engine262.inspect(completion) };
      }
    }

    let asyncResult;

    if (test.attrs.flags.async) {
      test262realm.setPrintHandle((m) => {
        if (m.stringValue && m.stringValue() === "Test262:AsyncTestComplete") {
          asyncResult = { status: "PASS" };
        } else {
          asyncResult = { status: "FAIL", error: m.stringValue ? m.stringValue() : Engine262.inspect(m) };
        }
        test262realm.setPrintHandle(undefined);
      });
    }

    const specifier = Path.resolve(Env.TEST262, test.file);

    let completion;
    if (test.attrs.flags.module) {
      completion = test262realm.realm.createSourceTextModule(specifier, test.contents);
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
      completion = test262realm.realm.evaluateScript(test.contents, { specifier });
    }

    if (completion instanceof Engine262.AbruptCompletion) {
      if (test.attrs.negative && isError(test.attrs.negative.type, completion.Value)) {
        return { status: "PASS" };
      } else {
        return { status: "FAIL", error: Engine262.inspect(completion) };
      }
    }

    if (test.attrs.flags.async) {
      if (!asyncResult) {
        throw new Error("missing async result");
      }
      return asyncResult;
    }

    if (test262realm.trackedPromises.length > 0) {
      return { status: "FAIL", error: Engine262.inspect(test262realm.trackedPromises[0]) };
    }

    if (test.attrs.negative) {
      return { status: "FAIL", error: `Expected ${test.attrs.negative.type} during ${test.attrs.negative.phase}` };
    } else {
      return { status: "PASS" };
    }
  });

};
