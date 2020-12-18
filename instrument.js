"use strict";

const Path = require("path");
const Fs = require("fs");
const Acorn = require("acorn");
const Aran = require("../aran/lib/index.js");

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

exports.reset = (setup) => {
  if (!(setup in cache)) {
    cache[setup] = {
      pointcut: global.eval(Fs.readFileSync(Path.join(__dirname, "setup", setup + "-pointcut.js"), "utf8")),
      advice: Fs.readFileSync(Path.join(__dirname, "setup", setup + "-advice.js"), "utf8")
    };
  }
  setup = cache[setup];
  aran = new Aran({parser});
  pointcut = setup.pointcut;
  return `const ${aran.namespace} = ${aran.intrinsic.script}${"\n"}${aran.namespace}["aran.advice"] = ${setup.advice}`;
};

exports.instrument = (code, source, serial) => aran.weave(code, {
  __proto__: null,
  output: "code"
  source,
  serial,
  pointcut
});
