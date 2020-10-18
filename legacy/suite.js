"use strict";

const Path = require("path");
const Os = require("os");
const Fs = require("fs");
const Util = require("util");
const ChildProcess = require("child_process");
const Glob = require("glob");
const ReadLine = require("readline");
const Env = require("./env.js");
const Prepare = require("./prepare.js");

const CPU_COUNT = Os.cpus().length;
// const NUM_WORKERS = Math.round(CPU_COUNT * 0.75);
const NUM_WORKERS = 1;
const RUN_SLOW_TESTS = process.argv.includes("--run-slow-tests");

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

async function* readdir(dir) {
  for await (const dirent of await Fs.promises.opendir(dir)) {
    const p = Path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* readdir(p);
    } else {
      yield p;
    }
  }
}

const Base = ((() => {

  process.on("unhandledRejection", (reason) => {
    Fs.writeSync(0, `\n${Util.inspect(reason)}\n`);
    process.exit(1);
  });

  const ANSI = {
    reset: "\u001b[0m",
    red: "\u001b[31m",
    green: "\u001b[32m",
    yellow: "\u001b[33m",
    blue: "\u001b[34m",
  };

  let skipped = 0;
  let passed = 0;
  let failed = 0;
  let total = 0;

  const start = Date.now();

  const handledPerSecLast5 = [];
  const pad = (n, l, c = "0") => n.toString().padStart(l, c);
  const average = (array) => (array.reduce((a, b) => a + b, 0) / array.length) || 0;

  const printStatusLine = () => {
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;

    const time = `${pad(min, 2)}:${pad(sec, 2)}`;
    const found = `${ANSI.blue}:${pad(total, 5, " ")}${ANSI.reset}`;
    const p = `${ANSI.green}+${pad(passed, 5, " ")}${ANSI.reset}`;
    const f = `${ANSI.red}-${pad(failed, 5, " ")}${ANSI.reset}`;
    const s = `${ANSI.yellow}»${pad(skipped, 5, " ")}${ANSI.reset}`;
    const testsPerSec = average(handledPerSecLast5);

    const line = `[${time}|${found}|${p}|${f}|${s}] (${testsPerSec.toFixed(2)}/s)`;

    ReadLine.clearLine(process.stdout, 0);
    ReadLine.cursorTo(process.stdout, 0);
    process.stdout.write(`${line}`);
  };

  let handledPerSecCounter = 0;

  setInterval(() => {
    handledPerSecLast5.unshift(handledPerSecCounter);
    handledPerSecCounter = 0;
    if (handledPerSecLast5.length > 5) {
      handledPerSecLast5.length = 5;
    }
  }, 1000).unref();

  process.stdout.write(`
  #######################
   engine262 Test Runner
   Detected ${CPU_COUNT} CPUs
  #######################

  `);

  printStatusLine();
  setInterval(() => {
    printStatusLine();
  }, 500).unref();

  process.on("exit", () => {
    printStatusLine();
    process.stdout.write("\n");
  });

  return {
    total() {
      total += 1;
    },
    pass() {
      passed += 1;
      handledPerSecCounter += 1;
    },
    fail(name, error) {
      failed += 1;
      handledPerSecCounter += 1;
      process.exitCode = 1;
      process.stderr.write(`\nFAILURE! ${name}\n${error}\n`);
    },
    skip() {
      skipped += 1;
      handledPerSecCounter += 1;
    },
  };

}) ());

const override = process.argv.find((e, i) => i > 1 && !e.startsWith("-"));

const createWorker = () => {
  const c = ChildProcess.fork(Path.join(__dirname, "worker.js"));
  c.on("message", (message) => {
    switch (message.status) {
      case "PASS":
        Base.pass();
        break;
      case "FAIL":
        Base.fail(message.description, message.error);
        break;
      case "SKIP":
        Base.skip();
        break;
      default:
        throw new RangeError(JSON.stringify(message));
    }
  });
  c.on("exit", (code) => {
    if (code !== 0) {
      process.exit(1);
    }
  });
  return c;
};

const workers = Array.from({ length: NUM_WORKERS }, () => createWorker());
let longRunningWorker;
if (RUN_SLOW_TESTS) {
  longRunningWorker = createWorker();
}

let workerIndex = 0;
const handleTest = (test) => {
  Base.total();

  if ((test.attrs.features && test.attrs.features.some((feature) => disabledFeatures.includes(feature)))
      || skiplist.includes(test.file)) {
    Base.skip();
    return;
  }

  if (slowlist.includes(test.file)) {
    if (RUN_SLOW_TESTS) {
      longRunningWorker.send(test);
    } else {
      Base.skip();
    }
  } else {
    workers[workerIndex].send(test);
    workerIndex += 1;
    if (workerIndex >= workers.length) {
      workerIndex = 0;
    }
  }
};

(async () => {

  for await (const file of readdir(Path.join(Env.TEST262, override || "test"))) {
    if (/annexB|intl402|_FIXTURE/.test(file)) {
      continue;
    }
    (await Prepare(file)).forEach(handleTest);
  }

  workers.forEach((w) => {
    w.send("DONE");
  });

  if (RUN_SLOW_TESTS) {
    longRunningWorker.send("DONE");
  }

})();
