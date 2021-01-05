"use strict";

const ChildProcess = require("child_process");
const Minimist = require("minimist");
const Path = require("path");
const Fs = require("fs");
const Util = require("util");
const Chalk = require("chalk");
const Parse = require("./parse.js");

const argv = global.Object.assign({
  __proto__: null,
  database: null,
  target: null
}, Minimist(process.argv.slice(2)));

if (argv.target === null) {
  process.stdout.write("Usage: node batch.js --target path/to/test262/source[.js] [--database path/to/database.json]\n", "utf8");
  process.exit(1);
}

argv.target = Path.resolve(argv.target);

const home = Fs.lstatSync(argv.target).isFile() ? Path.dirname(argv.target) : argv.target;

////////////
// Helper //
////////////

const cache = {
  __proto__: null,
  CACHE: Chalk.blue("done"),
  SUCCESS: Chalk.green("pass"),
  DISABLED: Chalk.yellow("off "),
  SKIP: Chalk.yellow("skip"),
  FAILURE: Chalk.red("fail"),
  ERROR: Chalk.bgRed("err "),
};

const display = (mode, kind, type) => {
  process.stdout.write(` | ${kind.substring(0, 4)}/${mode.padEnd(6, " ")} ${cache[type]}`, "utf8");
}

//////////////
// Database //
//////////////

let database = new global.Map([
  ["CURRENT", 0]
]);

if (argv.database !== null) {
  try {
    database = new global.Map(global.JSON.parse(Fs.readFileSync(argv.database, "utf8")));
  } catch (error) {
    process.stderr.write("Failed to load the database: " + error.message + "\n");
  }
}

const current = database.get("CURRENT");

///////////
// State //
///////////

const handler = ({mode, kind, type, path, abrupt, data}) => {
  const key = `${global.String(counter)}/${mode}/${kind}`;
  if (database === null) {
    return null;
  }
  if (type === "SUCCESS") {
    database.delete(key);
  } else {
    database.set(key, {
      type,
      specifier: Path.relative(home, path),
      abrupt,
      data
    });
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

const gather = function * (path) {
  if (Fs.lstatSync(path).isDirectory()) {
    for (let filename of Fs.readdirSync(path).sort()) {
      yield* gather(Path.join(path, filename));
    }
  } else if (/\.js$/.test(path) && !/annexB|intl402|_FIXTURE/.test(path)) {
    yield path;
  }
};

const iterator = gather(argv.target);

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
    for (let worker of workers) {
      worker.kill("SIGINT");
    }
    return save();
  }
  counter++;
  {
    let specifier = Path.relative(home, step.value);
    if (specifier.length > 90) {
      specifier = "..." + specifier.substring(specifier.length - 87, specifier.length)
    }
    process.stdout.write(`${global.String(counter).padStart(6, "0")} ${specifier.padEnd(90, " ")}`, "utf8");
  }
  for (let {mode, test} of Parse(step.value)) {
    for (let kind of ["inclusive", "exclusive"]) {
      const key = `${global.String(counter)}/${mode}/${kind}`;
      if ((counter < current) && !database.has(key)) {
        display(mode, kind, "CACHE");
      } else {
        const cache = database.has(key) ? database.get(key).abrupt : null;
        workers[concurrent].send({
          mode,
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
  const content = global.JSON.stringify(global.Array.from(database.entries()), null, 2);
  Fs.writeFileSync(argv.database === null ? process.stdout.fd : argv.database, content, "utf8");
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
