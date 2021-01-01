"use strict";
const Vm = require("vm");
const Path = require("path");
const Fs = require("fs");
const Agents = require("./agents");
const Minimist = require("minimist");
const Util = require("util");

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
const evalScript = (code, specifier) => {
  Fs.writeFileSync(Path.join(__dirname, "dump", nameof(++counter)), code, "utf8");
  return Vm.runInThisContext(code, {filename:specifier});
};
const agent = Agents.get(argv.agent)();
global.print = (value) => {
  console.log(Util.inspect(value));
};
global.$262 = {
  createRealm () {
    throw new global.Error("$262.createRealm() not implemented");
  },
  detachArrayBuffer () {
    throw new global.Error("$262.detachArrayBuffer() not implemented");
  },
  evalScript,
  gc () {
    throw new global.Error("$262.gc() not implemented");
  },
  global: global,
  get agent () {
    throw new global.Error("262.agent not implemented");
  },
  instrument: agent.instrument.script
};
evalScript(agent.setup);
let code = Fs.readFileSync(argv.target, "utf8");
code = agent.instrument.script(code, argv.target);
evalScript(code);
