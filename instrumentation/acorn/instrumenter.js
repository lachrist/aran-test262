"use strict";

const Escodegen = require("escodegen");
const Acorn = require("acorn");

module.exports = () => ({
  setup: null,
  script: (code, specifier) => Escodegen.generate(Acorn.parse(code, {
    ecmaVersion: 2020,
    sourceType: "script"
  })),
  module: (code, specifier) => Escodegen.generate(Acorn.parse(code, {
    ecmaVersion: 2020,
    sourceType: "module"
  })),
  eval: (code, location, specifier) => {
    throw new global.Error("$262.instrument should never be called");
  }
});
