"use strict";
const Vm = require("vm");
const Path = require("path");
const Fs = require("fs");
const Agents = require("./agents");

// const targets = [Path.join(__dirname, "test262", "harness", "assert.js")];
const targets = [Path.join(__dirname, "yo.js")];
const agent = Agents.get("aran-empty")();
global.$262 = {__instrument__: agent.instrument};
Vm.runInThisContext(agent.setup);
targets.forEach((target) => Vm.runInThisContext(
  `debugger;${agent.instrument(
    Fs.readFileSync(target, "utf8"),
    "script",
    null,
    target)}`));


    // (
    //           (
    //             (null, INTRINSIC["Reflect.get"]) (
    //             (INTRINSIC["aran.globalDeclarativeRecord"]),
    //             "x")) ===
    //           (INTRINSIC["aran.deadzoneMarker"]))
