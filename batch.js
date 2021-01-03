"use strict";

const ChildProcess = require("child_process");
const Path = require("path");
const Fs = require("fs");
const Util = require("util");
const Chalk = require("chalk");
const Gather = require("./gather.js");
const Parse = require("./parse.js");

////////////
// Helper //
////////////

const cache = {
  __proto__: null,
  CACHE: Chalk.blue("cache   "),
  SUCCESS: Chalk.green("success "),
  DISABLED: Chalk.yellow("disabled"),
  SKIP: Chalk.yellow("skip    "),
  FAILURE: Chalk.red("failure "),
  ERROR: Chalk.bgRed("error   "),
};

const display = (mode, kind, type) => {
  process.stdout.write(` | ${kind}/${mode.padEnd(6, " ")} ${cache[type]}`, "utf8");
}

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

const current = database.get("CURRENT");

///////////
// State //
///////////

const handler = ({type, kind, mode, specifier, abrupt, data}) => {
  if (database === null) {
    return null;
  }
  const key = `${global.String(counter)}/${mode}/${kind}`;
  if (type === "SUCCESS") {
    database.delete(key);
  } else {
    database.set(key, {type, specifier, abrupt, data});
  }
  display(mode, kind, type);
  concurrent--;
  if (concurrent === 0) {
    global.setImmediate(loop);
  }
};

let concurrent = 0;

const workers = [1, 2, 3, 4].map(() => {
  const worker = ChildProcess.fork(Path.join(__dirname, "batch-worker.js"));
  worker.on("message", handler);
  return worker;
});

let counter = 0;

const iterator = Gather(Path.join(__dirname, "test262", "test"));

//////////
// Loop //
//////////

const loop = () => {
  process.stdout.write("\n", "utf8");
  if (database === null) {
    return null;
  }
  const step = iterator.next();
  if (step.done) {
    save();
    for (let worker of workers) {
      worker.kill("SIGINT");
    }
  }
  counter++;
  const specifier = Path.relative(Path.join(__dirname, "test262", "test"), step.value);
  process.stdout.write(`${global.String(counter).padStart(6, "0")} ${specifier.padEnd(80, " ")}`, "utf8");
  for (let [mode, test] of Object.entries(Parse(step.value))) {
    for (let kind of ["inclusive", "exclusive"]) {
      const key = `${global.String(counter)}/${mode}/${kind}`;
      if ((counter < current) && !database.has(key)) {
        display(mode, kind, "CACHE");
      } else {
        const cache = database.has(key) ? database.get(key).abrupt : null;
        workers[concurrent].send({
          mode,
          specifier,
          test,
          kind,
          cache
        });
        concurrent++;
      }
    }
  }
  if (concurrent === 0) {
    global.setImmediate(loop);
  }
};

global.setImmediate(loop);

/////////////////
// Termination //
/////////////////

const save = () => {
  if (counter > current) {
    database.set("CURRENT", counter);
  }
  Fs.writeFileSync(Path.join(__dirname, "database.json"), global.JSON.stringify(global.Array.from(database.entries()), null, 2), "utf8");
};

process.on("SIGINT", () => {
  save();
  database = null;
  for (let worker of workers) {
    worker.kill();
  }
});

process.on("uncaughtException", (error) => {
  save();
  Fs.writeSync(process.stderr.fd, error.stack);
  process.exit(1);
});
