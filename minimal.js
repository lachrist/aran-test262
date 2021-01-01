"use strict";

const Vm = require("vm");
const Path = require("path");
const Fs = require("fs");
const Util = require("util");
const Minimist = require("minimist");
const Agents = require("./agents");

const argv = Minimist(process.argv.slice(2));
const agent = Agents.get(argv.agent)();
const target = Fs.readFileSync(argv.target, "utf8");
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
  evalScript (code, specifier) {
    if (!agent.enclave) {
      code = agent.instrument.script(code, specifier);
    }
    return Vm.runInThisContext(code, {filename:specifier});
  },
  gc () {
    throw new global.Error("$262.gc() not implemented");
  },
  global: global,
  get agent () {
    throw new global.Error("262.agent not implemented");
  },
  instrument: agent.instrument.eval
};
Vm.runInThisContext(agent.setup, {filename:"setup.js"});
Vm.runInThisContext(agent.instrument.script(target, argv.target), {filename:argv.target});
