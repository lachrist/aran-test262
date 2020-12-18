"use strict";

const Util = require("util");
const Minimist = require("minimist");
const Parse = require("./parse.js");
const Run = require("./run.js");

// node --target yo.js --agent aran-empty --mode normal
const argv = Minimist(process.argv.slice(2));
for (let test of Parse(argv.target)) {
  if (!argv.mode || argv.mode === test.mode) {
    for (let [name, agent] of Agents.entries()) {
      if (!argv.agent || argv.agent === name) {
        console.log(`${test.mode} >> ${name} >> ${Util.inspect(Run(agent(test)), {depth:0/0, colors:true})}`);
      }
    }
  }
}
