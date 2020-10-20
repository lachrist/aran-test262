"use strict";

const Path = require("path");
const Fs = require("fs");
const Glob = require("glob");

const Env = require("./env");
const Gather = require("./gather.js");
const Prepare = require("./prepare.js");
const Run = require("./run.js");
const Instrument = require("./instrument.js");
const Astring = require("astring");
const Acorn = require("acorn");

const readList = (name) => Fs.readFileSync(Path.join(Env.ENGINE262, "test", "test262", name), "utf8")
  .split("\n")
  .filter((line) => line !== "" && !line.startsWith("#"));

const readListPaths = (name) => readList(name)
  .flatMap((line) => Glob.sync(Path.resolve(Env.TEST262, "test", line)))
  .map((path) => Path.relative(Env.TEST262, path));

const slowlist = readListPaths("slowlist");
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
    console.log(JSON.stringify(outcome, null, 2));
    if (typeof outcome === "object" && outcome !== null) {
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

const intercepters = [
  ["engine262", (test) => test],
  ["acorn-astring", (test) => ({
    __proto__: test,
    content: Astring.generate(Acorn.parse(test.content, {ecmaVersion:2020}))
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
]));

((async () => {
  next: for await (const path of Gather(Path.join(Env.TEST262, "test"))) {
    const specifier = Path.relative(Env.TEST262, path);
    outcome.current = specifier;
    outcome.phase = "skipping";
    if (slowlist.includes(specifier)) {
      outcome.skipped.set(specifier, "engine262-slow");
      continue next;
    }
    if (skiplist.includes(specifier)) {
      outcome.skipped.set(specifier, "engine262-skipped");
      continue next;
    }
    const tests = await Prepare(path);
    if (disabledFeatures.includes(tests[0].attributes.features)) {
      outcome.skipped.set(specifier, "engine262-disabled");
      continue next;
    }
    if (tests[0].attributes.raw) {
      outcome.skipped.set(specifier, "aran-raw");
      continue next;
    }
    if (tests[0].attributes.module) {
      outcome.skipped.set(specifier, "aran-module");
      continue next;
    }
    for (let intercepter of intercepters) {
      for (let test of tests) {
        outcome.phase = {intercepter:intercepter[0], test:test};
        const result = Run(intercepter[1](test), Instrument.instrument);
        if (result.status !== 0) {
          outcome.failure.set(specifier, [intercepter[0], result]);
          continue next;
        }
      }
    }
    outcome.success.add(specifier);
  }
  return null;
}) ()).then(terminate, terminate);

process.on("uncaughtExceptionMonitor", terminate);

process.on("SIGINT", terminate);
