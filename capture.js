"use strict";
const Vm = require("vm");
const Path = require("path");
const Fs = require("fs");
const Agents = require("./agents");
const Minimist = require("minimist");

const argv = Minimist(process.argv.slice(2));
// const targets = [Path.join(__dirname, "test262", "harness", "assert.js")];
let counter = 0;
const MAX_LENGTH = 5;
const nameof = (number) => {
  let string = global.String(number);
  if (string.length > MAX_LENGTH) {
    throw new global.Error(`Out of bound id generation`);
  }
  while (string.length < MAX_LENGTH) {
    string = "0" + string;
  }
  return string + ".js";
};
Fs.readdirSync(Path.join(__dirname, "dump")).forEach((filename) => {
  Fs.unlinkSync(Path.join(__dirname, "dump", filename));
});
const evalScript = (code) => {
  Fs.writeFileSync(Path.join(__dirname, "dump", nameof(++counter)), code, "utf8");
  Vm.runInThisContext(code);
};
const agent = Agents.get(argv.agent)();
global.$262 = {
  __instrument__: agent.instrument,
  evalScript};
evalScript(agent.setup);
const original = Fs.readFileSync(argv.target, "utf8");
const instrumented = agent.instrument(original, "script", null, argv.target);
evalScript(instrumented);
