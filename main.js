"use strict";

const Path = require("path");
const Fs = require("fs");
const Util = require("util");
const Glob = require("glob");
const Escodegen = require("escodegen");
const Acorn = require("acorn");
const Chalk = require("chalk");
const Minimist = require("minimist");

const Env = require("./env.js");
const Status = require("./status.js");
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
  skipped: [],
  failure: [],
  success: []
};

const terminate = (error) => {
  try {
    Fs.writeFileSync(Path.join(__dirname, "outcome.json"), JSON.stringify(outcome, null, 2), "utf8");
    if (error === null) {
      return process.exit(0);
    } else {
      process.stderr.write(error.message + "\n" + error.stack + "\n");
    }
  } catch (error) {
    process.stderr.write("Termination error: " + String(error));
  } finally {
    process.exit(error === null ? 0 : 1);
  }
};

process.on("uncaughtException", terminate);

process.on("SIGINT", () => terminate(null));

const argv = Minimist(process.argv.slice(2));

const path = "target" in argv ? Path.resolve(argv.target) : Path.join(Env.TEST262, "test");

if (!path.startsWith(Env.TEST262)) {
  throw new Error("Invalid test home");
}

const offset = "offset" in argv ? parseInt(argv.offset) : 0;

let counter = 0;

const iterator = Gather(path);

const skip = (specifier, agent, reason) => {
  process.stdout.write(Chalk[agent === "aran" ? "bgYellow" : "yellow"](` skipped >> ${agent} >> ${reason}`) + "\n");
  outcome.skipped.push([specifier, agent, reason]);
  global.setImmediate(loop);
}

const fail = (specifier, intercepter, mode, result) => {
  process.stdout.write(Chalk[intercepter.startsWith("aran-") ? "bgRed" : "red"](` failed >> ${intercepter} >> ${mode} >> ${result.status}`) + "\n");
  outcome.failure.push([specifier, mode, intercepter, result]);
  global.setImmediate(loop);
};

const pass = (specifier) => {
  process.stdout.write(Chalk.green(` passed`) + "\n");
  outcome.success.push(specifier);
  global.setImmediate(loop);
};

const loop = () => {
  const step = iterator.next();
  if (step.done) {
    return null;
  }
  const path = step.value;
  counter++;
  if (counter < offset) {
    return global.setImmediate(loop);
  }
  process.stdout.write(`${Chalk.blue(counter)} ${path}...`);
  const specifier = Path.relative(Env.TEST262, path);
  if (slowlist.includes(specifier)) {
    return skip(specifier, "engine262", "slow");
  }
  if (skiplist.includes(specifier)) {
    return skip(specifier, "engine262", "skip");
  }
  const tests = Prepare(path);
  if (disabledFeatures.includes(tests[0][1].attributes.features)) {
    return skip(specifier, "engine262", "disabled");
  }
  if (tests[0][1].attributes.raw) {
    return skip(specifier, "aran", "raw");
  }
  if (tests[0][1].attributes.module) {
    return skip(specifier, "aran", "module");
  }
  for (let [name, intercepter] of intercepters.entries()) {
    for (let [mode, test] of tests) {
      try {
        const result = Run(intercepter(test), Instrument.instrument);
        if (result.status !== Status.SUCCESS) {
          return fail(specifier, name, mode, result);
        }
      } catch (error) {
        if (error instanceof Check.CheckError) {
          return skip(specifier, "aran", error.message);
        } else {
          throw error;
        }
      }
    }
  }
  return pass(specifier);
};

global.setImmediate(loop);
