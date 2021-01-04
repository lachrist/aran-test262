"use strict";

const Instrumentation = require("./instrumentation");
const Util = require("util");
const Minimist = require("minimist");
const Parse = require("./parse.js");
const Run = require("./run.js");

// node --target yo.js --mode normal|strict|module|raw --kind inclusive|exclusive --instrumentation empty
const argv = Minimist(process.argv.slice(2));

const print = (value) => Util.inspect(value, {depth:1/0, colors:true});

for (let {mode, test} of Parse(argv.target)) {
  if (!("mode" in argv) || (argv.mode === mode)) {
    for (let kind of ["inclusive", "exclusive"]) {
      if (!("kind" in argv) || (argv.kind === kind)) {
        for (let instrumentation of Instrumentation[kind]) {
          if (!("instrumentation" in argv) || (argv.instrumentation === instrumentation.name)) {
            process.stdout.write(`${mode} >> ${kind} >> ${instrumentation.name}`, "utf8");
            process.stdout.write(` >> ${Util.inspect(Run(test, kind, instrumentation.instrumenter))}${"\n"}`, "utf8");
          }
        }
      }
    }
  }
}
