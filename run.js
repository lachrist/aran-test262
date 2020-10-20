"use strict";

const Path = require("path");
const Fs = require("fs");
const Env = require("./env.js")

const Engine262 = require(Path.join(Env.ENGINE262, "dist", "engine262.js"));
const Engine262Test262Realm = require(Path.join(Env.ENGINE262, "bin", "test262_realm.js"));

const SUCCESS_STATUS = 0;
const INCLUDE_FAILURE_STATUS = 1;
const PRELUDE_FAILURE_STATUS = 2;
const CONTENT_FAILURE_STATUS = 3;
const MISSING_NEGATIVE_STATUS = 4;
const PENDING_PROMISE_STATUS = 5;
const ASYNC_PRINT_STATUS = 6;
const ASYNC_MISSING_STATUS = 7;

// exports.SUCCESS_STATUS = SUCCESS_STATUS;
// exports.INCLUDE_FAILURE_STATUS = INCLUDE_FAILURE_STATUS;
// exports.PRELUDE_FAILURE_STATUS = PRELUDE_FAILURE_STATUS;
// exports.CONTENT_FAILURE_STATUS = CONTENT_FAILURE_STATUS;
// exports.MISSING_NEGATIVE_STATUS = MISSING_NEGATIVE_STATUS;
// exports.PENDING_PROMISE_STATUS = PENDING_PROMISE_STATUS;
// exports.ASYNC_PRINT_STATUS = ASYNC_PRINT_STATUS;
// exports.ASYNC_MISSING_STATUS = ASYNC_MISSING_STATUS;

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

module.exports = (test, escape) => {

  test.attributes.includes.unshift("assert.js", "sta.js");

  if (test.attributes.flags.async)
    test.attributes.includes.unshift("doneprintHandle.js");

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

  // {file:test.file}
  const test262realm = Engine262Test262Realm.createRealm();

  // engine262.js:142527
  // function CreateBuiltinFunction(steps, internalSlotsList, realm, prototype, isConstructor = Value.false) {

  if (typeof escape === "function") {
    Engine262.CreateDataProperty(
      test262realm.$262,
      new Engine262.Value(Env.ESCAPE_IDENTIFIER),
      new Engine262.CreateBuiltinFunction(
        escape,
        [],
        test262realm.realm,
        test262realm.realm.Intrinsics['%Function.prototype%'],
        Engine262.Value.false));}

  return test262realm.realm.scope(() => {

    for (const include of test.attributes.includes) {
      if (!(include in cache))
        cache[include] = Fs.readFileSync(
          Path.join(Env.TEST262, "harness", include),
          "utf8");
      const completion = test262realm.realm.evaluateScript(
        cache[include],
        {specifier: Path.join(Env.TEST262, "harness", include)});
      if (completion instanceof Engine262.AbruptCompletion)
        return {
          status: INCLUDE_FAILURE_STATUS,
          completion: Engine262.inspect(completion),
          include: include};}

    {
      const completion = test262realm.realm.evaluateScript(PRELUDE);
      if (completion instanceof Engine262.AbruptCompletion)
        return {
          status: PRELUDE_FAILURE_STATUS,
          completion: Engine262.inspect(completion)};}

    let async_result = null;

    if (test.attributes.flags.async)
      test262realm.setPrintHandle((m) => {
        if (m.stringValue && m.stringValue() === "Test262:AsyncTestComplete")
          async_result = {status:SUCCESS_STATUS};
        else
          async_result = {
            status: ASYNC_PRINT_STATUS,
            message: m.stringValue ? m.stringValue() : Engine262.inspect(m)};
        test262realm.setPrintHandle(undefined);});

    {
      const specifier = Path.resolve(Env.TEST262, test.path);
      let completion;
      if (test.attributes.flags.module) {
        completion = test262realm.realm.createSourceTextModule(specifier, test.content);
        if (!(completion instanceof Engine262.AbruptCompletion)) {
          const module = completion;
          test262realm.resolverCache.set(specifier, module);
          completion = module.Link();
          if (!(completion instanceof Engine262.AbruptCompletion)) {
            completion = module.Evaluate();}
          if (
            (
              !(completion instanceof Engine262.AbruptCompletion) &&
              completion.PromiseState === "rejected")) {
            completion = Engine262.Throw(completion.PromiseResult);}}}
      else {
        completion = test262realm.realm.evaluateScript(test.content, { specifier }); }
      if (completion instanceof Engine262.AbruptCompletion)
        return (
          (
            test.attributes.negative &&
            isError(test.attributes.negative.type, completion.Value)) ?
          {status:SUCCESS_STATUS} :
          {
            status: CONTENT_FAILURE_STATUS,
            completion: Engine262.inspect(completion)});}

    if (test.attributes.flags.async)
      return (
        async_result === null ?
        {satus: ASYNC_MISSING_STATUS} :
        async_result);

    if (test262realm.trackedPromises.length > 0)
      return {
        status: PENDING_PROMISE_STATUS,
        promise: Engine262.inspect(test262realm.trackedPromises[0])};

    if (test.attributes.negative)
      return {
        status: NEGATIVE_FAILURE_STATUS};

    return {status:SUCCESS_STATUS};

  });

};
