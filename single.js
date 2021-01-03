"use strict";

const Instrumentation = require("./instrumentation");
const Parse = require("./parse.js");
const Run = require("./run.js");

// node --target yo.js --agent aran-empty --mode normal --kind  
const argv = Minimist(process.argv.slice(2));

const print = (value) => Util.inspect(value, {depth:1/0, colors:true});

for (let test of Parse(argv.target)) {
  if (!("mode" in argv) || (argv.mode === test.mode)) {
    for (let kind of ["inclusive", "exclusive"]) {
      if (!("kind" in argv) || (argv.kind === kind)) {
        for (let instrumentation of Instrumentation[kind]) {
          if (!("instrumentation" in argv) || (argv.instrumentation === instrumentation.name)) {
            console.log(`${mode} >> ${kind} >> ${instrumentation.name} >> ${Util.inspect(Run(test, kind, instrumentation.instrumenter))}`);
          }
        }
      }
    }
  }
}

