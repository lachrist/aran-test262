"use strict";

const Instrumentation = require("./instrumentation");
const Parse = require("./parse.js");
const Run = require("./run.js");

module.exports = (specifier, mode, kind, cache) => {
  if (cache === null) {
    return null;
  }
  const test = Parse(specifier)[mode];
  if (!test) {
    return null;
  }
  while 
  for (let instrumentation of Instrumentation[kind]) {
    if (cache)
    const result = Run(test, instrumentation);
    if (result !== null) {
      return result
    }
  }
  return null;
};

// // node --target yo.js --agent aran-empty --mode normal --dump
// const argv = Minimist(process.argv.slice(2));
// const print = (value) => Util.inspect(value, {depth:0/0, colors:true});
// for (let test of Parse(argv.target)) {
//   if (!argv.mode || argv.mode === test.mode) {
//     console.log(`Mode: ${test.mode}`);
//     console.log(Array(`Mode: ${test.mode}`.length + 1).join("=") + "\n");
//     if ("agent" in argv) {
//       console.log(print(Run(test, Agents.get(argv.agent), argv.dump)));
//     } else {
//       for (let [name, agent] of Agents.entries()) {
//         if (!argv.agent || argv.agent === name) {
//           console.log(`Agent: ${name}`);
//           console.log(print(Run(test, agent)));
//           console.log("");
//         }
//       }
//     }
//   }
// }
