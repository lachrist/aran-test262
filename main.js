"use strict";

const Path = require("path");
const Fs = require("fs");
const Glob = require("glob");

const Env = require("./env");
const Gather = require("./gather.js");
const Prepare = require("./prepare.js");
const Run = require("./run.js");
const Acorn = require("acorn");
const Astring = require("astring");
const Aran = require("../aran/lib/index.js");

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
  skipped: new Map(),
  failure: new Map(),
  success: new Set()
};

let pointcut;

let aran;

const instrument = (code, serial) => {
  const estree1 = Acorn.parse(code, {ecmaVersion:2020});
  const estree2 = aran.weave(estree1, pointcut, serial);
  return Astring.generate(estree2);
};

const pointcuts = {__proto__:null};

const advices = {__proto__:null};

const intercepters = [
  ["engine262", (test) => test],
  ["acorn-astring", (test) => ({
    path: test.path,
    attributes: test.attributes,
    content: Astring.generate(Acorn.parse(test.content, {ecmaVersion:2020}))
  })]
].concat(["empty"].map((name) => {
  pointcuts[name] = global.eval(Fs.readFileSync(Path.join(__dirname, "setup", name + "-pointcut.js"), "utf8"));
  advices[name] = Acorn.parse(Fs.readFileSync(Path.join(__dirname, "setup", name + "-advice.js"), "utf8").replace(/__ESCAPE__IDENTIFIER__/, () => Env.__ESCAPE__IDENTIFIER__), {ecmaVersion:2020});
  return [
    "aran-" + name,
    (test) => {
      aran = new Aran();
      pointcut = pointcuts[name];
      return {
        path: test.path,
        attributes: test.attributes,
        content: Astring.generate({
          type: "Program",
          body: [{
            type: "ExpressionStatement",
            expression: {
              type: "CallExpression",
              optional: false,
              callee: {
                type: "CallExpression",
                optional: false,
                callee: aran.weave(Acorn.parse(test.content, {ecmaVersion:2020}), pointcut, null).body[0].expression,
                arguments: [aran.builtin.estree.body[0].expression]
              },
              arguments: [advices[name].body[0].expression]
            }
          }]
        })
      }
    }
  ];
}));

((async () => {
  next: for await (const path of Gather(Path.join(Env.TEST262, "test"))) {
    const specifier = Path.relative(Env.TEST262, path);
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
        const result = Run(intercepter[1](test));
        if (result.status !== 0) {
          outcome.failure.set(specifier, [intercepter[0], result]);
          continue next;
        }
      }
    }
    outcome.success.add(specifier);
  }
}) ()).catch((error) => {
  console.log(outcome);
  process.stderr.write(error.message + "\n" + error.stack + "\n");
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log(outcome);
  process.exit(0);
});
