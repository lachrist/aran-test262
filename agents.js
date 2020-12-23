"use strict";

const Escodegen = require("escodegen");
const Acorn = require("acorn");
const AranAgent = require("./aran-agent");

module.exports = new Map([
  [
    "noop",
    () => ({
      setup: ``,
      instrument: (code, source, location) => code})],
  [
    "acorn-escodegen",
    () => ({
      setup: ``,
      instrument: (code, source, location) => Escodegen.generate(
        Acorn.parse(
          code,
          {
            ecmaVersion: 2020,
            sourceType: source === "module" ? "module" : "script"}))})],
  [
    "aran-enclave-empty",
    AranAgent("enclave-empty")],
  [
    "aran-empty",
    AranAgent("empty")]]);
