"use strict";

const Escodegen = require("escodegen");
const Acorn = require("acorn");
const AranAgent = require("./aran-agent");

module.exports = new Map([
  ["engine262", (test) => test],
  ["acorn-escodegen", (test) => ({
    __proto__: test,
    content: Escodegen.generate(Acorn.parse(test.content, {
      ecmaVersion: 2020,
      sourceType: test.mode === "module" ? "module" : "script"
    }))
  })],
  ["aran-empty", AranAgent("empty")]
]);
