"use strict";

const Path = require("path");
const Fs = require("fs");
const Util = require("util");
const Glob = require("glob");
const Escodegen = require("Escodegen");
const Acorn = require("acorn");
const Minimist = require("minimist");

const Env = require("./env.js");
const Gather = require("./gather.js");
const Prepare = require("./prepare.js");
const Run = require("./run.js");
const Instrument = require("./instrument.js");
const Check = require("./check.js");

const intercepters = new Map([
  ["engine262", (test) => test],
  ["acorn-escodegen", (test) => ({
    __proto__: test,
    content: Escodegen.generate(Acorn.parse(test.content, {ecmaVersion:2020}))
  })]
].concat(["empty"].map((name) => [
  "aran-" + name,
  (test) => {
    Instrument.reset(name);
    return {
      __proto__: test,
      content: Instrument.instrument(test.content, null)
    };
  }
])));

const readList = (name) => Fs.readFileSync(Path.join(Env.ENGINE262, "test", "test262", name), "utf8")
  .split("\n")
  .filter((line) => line !== "" && !line.startsWith("#"));

const readListPaths = (name) => readList(name)
  .flatMap((line) => Glob.sync(Path.resolve(Env.TEST262, "test", line)))
  .map((path) => Path.relative(Env.TEST262, path));

const slowlist = readListPaths("slowlist").concat([
  "test/built-ins/Array/prototype/concat/Array.prototype.concat_large-typed-array.js"
]);
const skiplist = readListPaths("skiplist");
const disabledFeatures = readList("features")
  .filter((line) => line.startsWith("-"))
  .map((line) => line.substring(1));

const outcome = {
  __proto__:null,
  current: null,
  phase: null,
  skipped: new Map(),
  failure: new Map(),
  success: new Set()
};

const terminate = (error) => {
  try {
    // console.log(JSON.stringify(outcome, null, 2));
    console.log(Util.inspect(outcome, {depth:1/0, colors:true}));
    if (typeof outcome.phase === "object" && outcome.phase !== null) {
      Fs.writeFileSync(Path.join(__dirname, "last-test-content.js"), outcome.phase.test.content, "utf8");
    }
    if (error === null || error === void 0) {
      return process.exit(0);
    }
    if (error instanceof Error) {
      process.stderr.write(error.message + "\n" + error.stack + "\n");
    } else {
      process.stderr.write(`Unexpected termination value: ${String(error)}`);
    }
    return process.exit(1);
  } catch (error) {
    process.stderr.write(`Termination error: ${String(error)}`);
  } finally {
    process.exit(1);
  }
};

const argv = Minimist(process.argv.slice(2));

const path = "target" in argv ? Path.resolve(argv.target) : Path.join(Env.TEST262, "test");

if (!path.startsWith(Env.TEST262)) {
  throw new Error("Invalid test home");
}

const offset = "offset" in argv ? parseInt(argv.offset) : 0;

let counter = 0;

Gather(path, (path) => {
  counter++;
  if (counter < offset) {
    return null;
  }
  console.log(counter, path);
  const specifier = Path.relative(Env.TEST262, path);
  outcome.current = specifier;
  outcome.phase = "skipping";
  if (slowlist.includes(specifier)) {
    outcome.skipped.set(specifier, "engine262-slow");
    return null;
  }
  if (skiplist.includes(specifier)) {
    outcome.skipped.set(specifier, "engine262-skipped");
    return null;
  }
  const tests = Prepare(path);
  if (disabledFeatures.includes(tests[0].attributes.features)) {
    outcome.skipped.set(specifier, "engine262-disabled");
    return null;
  }
  if (tests[0].attributes.raw) {
    outcome.skipped.set(specifier, "aran-raw");
    return null;
  }
  if (tests[0].attributes.module) {
    outcome.skipped.set(specifier, "aran-module");
    return null;
  }
  for (let [name, intercepter] of intercepters.entries()) {
    for (let test of tests) {
      outcome.phase = {intercepter:name, test:test};
      try {
        const result = Run(intercepter(test), Instrument.instrument);
        if (result.status !== 0) {
          outcome.failure.set(specifier, [name, result]);
          return null;
        }
      } catch (error) {
        if (error instanceof Check.CheckError) {
          outcome.skipped.set(specifier, "aran-" + error.message);
          return null;
        } else {
          throw error;
        }
      }
    }
  }
  outcome.success.add(specifier);
  return null;
});

process.on("uncaughtExceptionMonitor", terminate);

process.on("SIGINT", terminate);
