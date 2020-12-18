"use strict";

const Util = require("util");
const Minimist = require("minimist");
const Agents = require("./agents.js");
const Parse = require("./parse.js");
const Run = require("./run.js");

// node --target yo.js --agent aran-empty --mode normal
const argv = Minimist(process.argv.slice(2));
const print = (value) => Util.inspect(value, {depth:0/0, colors:true});
for (let test of Parse(argv.target)) {
  if (!argv.mode || argv.mode === test.mode) {
    console.log(`Mode: ${test.mode}`);
    if ("agent" in argv) {
      console.log(print(Run(test, Agents.get(argv.agent))));
    } else {
      for (let [name, agent] of Agents.entries()) {
        if (!argv.agent || argv.agent === name) {
          console.log(`Agent: ${name}`);
          // console.log(test.attributes);
          // console.log(test.setup);
          // console.log(test.content);
          console.log(print(Run(test, agent)));
        }
      }
    }
  }
}
