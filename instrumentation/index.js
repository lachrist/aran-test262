"use strict";

const Skip = require("./skip.js");
const Instrumenter = require("./instrumenter.js");

[
  "inclusive",
  "exclusive"
].forEach((kind) => {
  exports[kind] = [
    ["engine262", "raw"],
    ["acorn", "raw"],
    ["empty", "aran"]
  ].map(([name, sort]) => ({
    name,
    skip: Skip(kind, name),
    instrumenter: Instrumenter[sort](kind, name)
  }));
});
