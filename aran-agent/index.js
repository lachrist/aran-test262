"use strict";

const Path = require("path");
const Fs = require("fs");
const Acorn = require("acorn");
const Aran = require("../../aran/lib/index.js");

let aran = null;
let pointcut = null;

const cache = {__proto__:null};

const parser = {
  script: (code, options) => Acorn.parse(code, {
    __proto__: null,
    ecmaVersion: 2020,
    sourceType: "script"
  }),
  module: (code, options) => Acorn.parse(code, {
    __proto__: null,
    ecmaVersion: 2020,
    sourceType: "module"
  })
};

module.exports = (name) => {
  cache[name] = {
    pointcut: global.eval(Fs.readFileSync(Path.join(__dirname, name + "-pointcut.js"), "utf8")),
    advice: Fs.readFileSync(Path.join(__dirname, name + "-advice.js"), "utf8")
  };
  return () => ({
    setup: reset(name),
    instrument
  })
};

const reset = (name) => {
  aran = new Aran({parser});
  pointcut = cache[name].pointcut;
  return `this[${global.JSON.stringify(aran.namespace)}] = ${aran.intrinsic.script}${"\n"}${aran.namespace}["aran.advice"] = ${cache[name].advice}`;
};

const instrument = (code, source, serial) => aran.weave(code, {
  __proto__: null,
  output: "code",
  source,
  serial,
  pointcut
});
