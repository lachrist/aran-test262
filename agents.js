"use strict";

const Escodegen = require("escodegen");
const Acorn = require("acorn");
const AranAgent = require("./aran-agent");

const make_noop_agent = (enclave) => () => ({
  setup: ``,
  enclave,
  instrument: {
    module: (code, specifier) => code,
    script: (code, specifier) => code,
    eval: (code, location, specifier) => {
      throw new global.Error("$262.instrument should never be called");
    }
  }
});

const make_acorn_escodegen_agent = (enclave) => () => ({
  setup: ``,
  enclave,
  instrument: {
    module: (code, specifier) => Escodegen.generate(Acorn.parse(code, {ecmaVersion:2020, sourceType:"module"})),
    script: (code, specifier) => Escodegen.generate(Acorn.parse(code, {ecmaVersion:2020, sourceType:"script"})),
    eval: (code, location, specifier) => {
      throw new global.Error("$262.instrument should never be called");
    }
  }
});

module.exports = new Map([
  [
    "enclave-noop",
    make_noop_agent(true)
  ], [
    "noop",
    make_noop_agent(false)
  ], [
    "enclave-acorn-escodegen",
    make_acorn_escodegen_agent(true)
  ], [
    "acorn-escodegen",
    make_acorn_escodegen_agent(false)
  ], [
    "aran-enclave-empty",
    AranAgent("enclave-empty")
  ], [
    "aran-empty",
    AranAgent("empty")
  ]
]);
