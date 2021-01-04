"use strict";

const Fs = require("fs");
const Path = require("path");
const Glob = require("glob");

module.exports = (kind, name) => new global.Set([
  ...common(Path.join(__dirname, name, "skip.txt")),
  ...common(Path.join(__dirname, name, kind, "skip.txt"))
]);

const common = (path) => {
  let lines = Fs.readFileSync(path, "utf8").split("\n");
  lines = lines.filter((line) => line !== "" && !line.startsWith("#"));
  return lines.flatMap((line) => Glob.sync(Path.join(__dirname, "..", "test262", "test", line)));
  // return paths.map((path) => Path.relative(Path.join(__dirname, "..", "test262", "test"), path));
};