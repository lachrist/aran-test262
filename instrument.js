"use strict";

const Path = require("path");
const Fs = require("fs");
const Acorn = require("acorn");
const Escodegen = require("escodegen");
const Aran = require("../aran/lib/index.js");
const Check = require("./check.js");

let aran = null;
let pointcut = null;
let advice = null;

const cache = {__proto__:null};

exports.reset = (setup) => {
  if (typeof setup === "string") {
    if (!(setup in cache)) {
      const pointcut = global.eval(Fs.readFileSync(Path.join(__dirname, "setup", setup + "-pointcut.js"), "utf8"));
      const advice = Acorn.parse(Fs.readFileSync(Path.join(__dirname, "setup", setup + "-advice.js"), "utf8"), {ecmaVersion:2020});
      if (advice.body.length !== 1) {
        throw new Error("Advice programs should consist of a single statement");
      }
      if (advice.body[0].type !== "ExpressionStatement") {
        throw new Error("Advice programs should consist of a single expression statement");
      }
      cache[setup] = {pointcut, advice};
    }
    setup = cache[setup];
  }
  aran = new Aran();
  pointcut = setup.pointcut;
  advice = setup.advice;
};

exports.instrument = (code, serial) => {
  let estree = Acorn.parse(code, {ecmaVersion:2020});
  Check.check(estree);
  estree = aran.weave(estree, pointcut, serial);
  if (serial === null || serial === global.undefined) {
    estree = {
      type: "Program",
      body: [{
        type: "ExpressionStatement",
        expression: {
          type: "CallExpression",
          optional: false,
          callee: {
            type: "CallExpression",
            optional: false,
            callee: estree.body[0].expression,
            arguments: [aran.builtin.estree.body[0].expression]
          },
          arguments: [advice.body[0].expression]
        }
      }]
    };
  }
  return Escodegen.generate(estree);
};
