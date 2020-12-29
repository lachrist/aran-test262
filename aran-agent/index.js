"use strict";

const Path = require("path");
const Fs = require("fs");
const Acorn = require("acorn");
const Aran = require("../../aran/lib/index.js");

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
  const pointcut = global.eval(Fs.readFileSync(Path.join(__dirname, name + "-pointcut.js"), "utf8"));
  const advice = Fs.readFileSync(Path.join(__dirname, name + "-advice.js"), "utf8");
  return () => {
    const aran = new Aran({parser});
    return {
      setup: (
        `let eval = this.eval;${
          "\n"
        }this[${global.JSON.stringify(aran.namespace)}] = ${aran.intrinsic.script}${
          "\n"
        }${aran.namespace}["aran.advice"] = ${advice};`
      ),
      enclave: name.startsWith("enclave-"),
      instrument: {
        module: (code, specifier) => aran.weave(code, {
          output: "code",
          source: "module",
          pointcut
        }),
        script: (code, specifier) => aran.weave(code, {
          output: "code",
          source: "script",
          pointcut
        }),
        eval: (code, location, specifier) => aran.weave(code, {
          output: "code",
          source: "eval",
          serial: location,
          pointcut
        })
      }
    };
  };
};
