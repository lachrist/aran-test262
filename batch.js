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

let database = new global.Map([
  ["CURRENT", 0]
]);

try {
  database = new global.Map(global.JSON.parse(Fs.readFileSync(Path.join(__dirname, "database.json"), "utf8")));
} catch (error) {
  process.stderr.write("Failed to load the database: " + error.message + "\n");
}

//////////
// Loop //
//////////

const current = database.get("CURRENT");

let counter = 0;

const loop = (iterator) => {
  const step = iterator.next();
  if (step.done) {
    return terminate(null);
  }
  const specifier = Path.relative(Path.join(__dirname, "test262", "test"), step.value);
  for (let [mode, test] of Object.entries(Parse(step.value))) {
    abrupt: for (let kind of ["inclusive", "exclusive"]) {
      counter++;
      process.stdout.write(`${Chalk.blue(global.String(counter))} ${specifier} ${mode} ${kind}...`, "utf8");
      let cache = null;
      if (counter <= current) {
        if (database.has(counter)) {
          cache = database.get(counter).abrupt;
        } else {
          process.stdout.write(Chalk.green(` cache`) + "\n", "utf8");
          continue abrupt;
        }
      }
      for (let instrumentation of Instrumentation[kind]) {
        if (instrumentation.skip.has(specifier)) {
          database.set(counter, {
            type: "SKIP",
            specifier,
            mode,
            abrupt: instrumentation.name,
            data: null
          });
          process.stdout.write(Chalk.yellow(` skip ${instrumentation.name}`) + "\n", "utf8");
          continue abrupt;
        }
        if (instrumentation.name === cache) {
          cache = null;
        }
        if (cache === null) {
          try {
            const failure = Run(test, kind, instrumentation.instrumenter);
            if (failure !== null) {
              database.set(counter, {
                type: "FAILURE",
                specifier,
                mode,
                abrupt: instrumentation.name,
                data: failure
              });
              process.stdout.write(Chalk.red(` failure ${instrumentation.name} ${failure.status}`) + "\n", "utf8");
              continue abrupt;
            }
          } catch (error) {
            database.set(counter, {
              type: "ERROR",
              specifier,
              mode,
              abrupt: instrumentation.name,
              data: {
                name: error.name,
                message: error.message,
                stack: error.stack
              }
            });
            process.stdout.write(Chalk.bgRed(` error ${instrumentation.name} ${error.stack}`) + "\n", "utf8");
            continue abrupt;
          }
        }
      }
      database.delete(counter);
      process.stdout.write(Chalk.green(` success`) + "\n", "utf8");
    }
  }
  global.setImmediate(loop, iterator);
};


/////////////////
// Termination //
/////////////////

const terminate = (error) => {
  try {
    if (counter > current) {
      database.set("CURRENT", counter);
    }
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

///////////
// Start //
///////////

global.setImmediate(loop, Gather(Path.join(__dirname, "test262", "test")));
