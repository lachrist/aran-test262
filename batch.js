"use strict";

const Path = require("path");
const Fs = require("fs");
const Util = require("util");
const Glob = require("glob");
const Chalk = require("chalk");
const Minimist = require("minimist");

const Env = require("./env.js");
const Gather = require("./gather.js");
const Agents = require("./agents.js");
const Parse = require("./parse.js");
const Run = require("./run.js");

//////////
// Argv //
//////////

// node batch --target yo.js --agent aran-empty --mode normal --slow
const argv = Minimist(process.argv.slice(2));

// if ("reset-done" in argv) {
//   Fs.writeFileSync(Path.join(__dirname, "donelist.txt"), "", "utf8");
// }

const path = "target" in argv ? Path.resolve(argv.target) : Path.join(Env.TEST262, "test");

// if (!path.startsWith(Env.TEST262)) {
//   process.stderr.write("Test home should be " + Env.TEST262 + "\n");
//   process.exit(1);
// }

/////////////////
// Termination //
/////////////////

let database = new global.Map();

// let database = {
//   skipped: new global.Set(),
//   failure: new global.Set(),
//   success: new global.Set()
// };

try {
  database = new global.Map(global.JSON.parse(Fs.readFileSync(Path.join(__dirname, "database.json"), "utf8")));
} catch (error) {
  process.stderr.write("Failed to load the database: " + error.message + "\n");
}

const terminate = (error) => {
  try {
    if (path.startsWith(Env.TEST262)) {
      Fs.writeFileSync(Path.join(__dirname, "database.json"), global.JSON.stringify(global.Array.from(database.entries()), null, 2), "utf8");
    }
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

//////////////////
// Intercepters //
//////////////////


///////////
// Lists //
///////////

const read_list = (path) => Fs.readFileSync(path, "utf8").split("\n").filter((line) => line !== "" && !line.startsWith("#"));

const read_list_path = (path) => read_list(path).flatMap((line) => Glob.sync(Path.resolve(Env.TEST262, "test", line))).map((path) => Path.relative(Env.TEST262, path));

const engine262_slow_list = new Set(read_list_path(Path.join(Env.ENGINE262, "test", "test262", "slowlist")));
const engine262_skip_list = new Set(read_list_path(Path.join(Env.ENGINE262, "test", "test262", "skiplist")));
const engine262_disabled_feature_list = new Set(read_list(Path.join(Env.ENGINE262, "test", "test262", "features")).filter((line) => line.startsWith("-")).map((line) => line.substring(1)));

const aran_skip_list = new Set(read_list_path(Path.join(__dirname, "skiplist.txt")));
const aran_disabled_feature_list = new Set(read_list_path(Path.join(__dirname, "disabled-features.txt")));

const is_aran_disabled_feature = (feature) => aran_disabled_feature_list.has(feature);
const is_engine262_disabled_feature = (feature) => engine262_disabled_feature_list.has(feature);

// const donelist = new Set(Fs.readFileSync(Path.join(__dirname, "donelist.txt"), "utf8").split("\n"));

//////////
// Loop //
//////////

const skip = (specifier, agent, reason) => {
  process.stdout.write(Chalk[agent === "aran" ? "bgYellow" : "yellow"](` skipped >> ${agent} >> ${reason}`) + "\n", "utf8");
  database.set(specifier, ["SKIPPED", agent, reason]);
  global.setImmediate(loop);
};

const done = (specifier) => {
  process.stdout.write(Chalk.green(" done") + "\n", "utf8");
  global.setImmediate(loop);
};

const fail = (specifier, intercepter, mode, result) => {
  process.stdout.write(Chalk[intercepter.startsWith("aran-") ? "bgRed" : "red"](` failure >> ${intercepter} >> ${mode}`) + "\n" + Util.inspect(result, {depth:0/0}) + "\n", "utf8");
  database.set(specifier, ["FAILURE", intercepter, mode, result]);
  global.setImmediate(loop);
};

const pass = (specifier) => {
  process.stdout.write(Chalk.green(` passed`) + "\n", "utf8");
  database.set(specifier, null);
  global.setImmediate(loop);
};

let counter = 0;

const iterator = Gather(path);

const loop = () => {
  const step = iterator.next();
  if (step.done) {
    return terminate(null);
  }
  const specifier = Path.relative(Env.TEST262, step.value);
  process.stdout.write(`${Chalk.blue(global.String(++counter))} ${specifier} ...`);
  if (database.has(specifier) && database.get(specifier) === null) {
    return done(specifier);
  }
  if (engine262_slow_list.has(specifier) && !argv.slow) {
    return skip(specifier, "engine262", "slow");
  }
  if (engine262_skip_list.has(specifier)) {
    return skip(specifier, "engine262", "skip");
  }
  if (aran_skip_list.has(specifier)) {
    return skip(specifier, "aran", "skip");
  }
  const tests = Parse(step.value);
  if ("features" in tests[0].attributes) {
    if (tests[0].attributes.features.some(is_engine262_disabled_feature)) {
      return skip(specifier, "engine262", "disabled-feature");
    }
    if (tests[0].attributes.features.some(is_aran_disabled_feature)) {
      return skip(specifier, "aran", "disabled-feature");
    }
  }
  if (tests[0].attributes.raw) {
    return skip(specifier, "aran", "raw");
  }
  // if (tests[0][1].attributes.module) {
  //   return skip(specifier, "aran", "module");
  // }
  for (let [name, agent] of Agents.entries()) {
    for (let test of tests) {
      if (!("mode" in argv) || test.mode === argv.mode) {
        try {
          const result = Run(agent(test));
          if (result !== null) {
            return fail(specifier, name, test.mode, result);
          }
        } catch (error) {
          if (error.name === "MissingFeatureAranError") {
            return skip(specifier, "aran", error.message);
          }
          throw error;
        }
      }
    }
  }
  return pass(specifier);
};

global.setImmediate(loop);