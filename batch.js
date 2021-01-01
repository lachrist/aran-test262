"use strict";
global.Error.stackTraceLimit = 1/0;

const Path = require("path");
const Fs = require("fs");
const Util = require("util");
const Chalk = require("chalk");
const Minimist = require("minimist");

const Env = require("./env.js");
const Gather = require("./gather.js");
const Instrumentation = require("./instrumentation");
const Parse = require("./parse.js");
const Run = require("./run.js");

//////////////
// Database //
//////////////

let database = new global.Map();

try {
  const {current, } = 
  database = new global.Map(global.JSON.parse(Fs.readFileSync(Path.join(__dirname, "database.json"), "utf8")));
} catch (error) {
  process.stderr.write("Failed to load the database: " + error.message + "\n");
}

/////////////////
// Termination //
/////////////////

const terminate = (error) => {
  try {
    Fs.writeFileSync(Path.join(__dirname, "database.json"), global.JSON.stringify(global.Array.from(database.entries()), null, 2), "utf8");
    if (error === null) {
      return process.exit(0);
    } else {
      process.stderr.write(error.stack + "\n");
    }
  } catch (error) {
    process.stderr.write("Termination error: " + String(error));
  } finally {
    process.exit(error === null ? 0 : 1);
  }
};

process.on("uncaughtException", terminate);

process.on("SIGINT", () => terminate(null));

//////////
// Loop //
//////////

const loop = (iterator, counter) => {
  const step = iterator.next();
  if (step.done) {
    return terminate(null);
  }
  const specifier = Path.relative(Path.join(__dirname, "test262", "test"), step.value);
  for (let [mode, test] of Object.entries(Parse(step.value))) {
    abrupt: for (let kind of ["inclusive", "exclusive"]) {
      counter++;
      const key = `${kind}/${mode}/${specifier}`;
      process.stdout.write(`${Chalk.blue(global.String(counter))} ${specifier} ${mode} ${kind}...`, "utf8");
      let reached = true;
      let cache = null;
      if (database.has(key)) {
        if (database.get(key) === null) {
          process.stdout.write(Chalk.green(" cache") + "\n", "utf8");
          continue abrupt;
        }
        reached = false;
        cache = database.get(key).name;
      }
      for (let instrumentation of Instrumentation[kind]) {
        if (instrumentation.skip.has(specifier)) {
          database.set(key, {
            type: "SKIP",
            name: instrumentation.name,
            data: null
          });
          process.stdout.write(Chalk.yellow(` skip ${instrumentation.name}`) + "\n", "utf8");
          continue abrupt;
        }
        reached = reached || instrumentation.name === cache;
        if (reached) {
          try {
            const failure = Run(test, kind, instrumentation.instrumenter);
            if (failure !== null) {
              database.set(key, {
                type: "FAILURE",
                name: instrumentation.name,
                data: failure
              });
              process.stdout.write(Chalk.red(` failure ${instrumentation.name} ${failure.status}`) + "\n", "utf8");
              continue abrupt;
            }
          } catch (error) {
            database.set(key, {
              type: "ERROR",
              name: instrumentation.name,
              data: {
                name: error.name,
                message: error.message,
              }
            });
            process.stdout.write(Chalk.bgRed(` error ${instrumentation.name} ${error.stack}`) + "\n", "utf8");
            continue abrupt;
          }
        }
      }
      database.set(key, null);
      process.stdout.write(Chalk.green(" pass") + "\n", "utf8");
    }
  }
  global.setImmediate(loop, iterator, counter);
};

global.setImmediate(loop, Gather(Path.join(__dirname, "test262", "test")), 0);
