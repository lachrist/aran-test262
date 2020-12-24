"use strict";
const Vm = require("vm");
const Path = require("path");
const Fs = require("fs");
const js = (filename) => /.js$/.test(filename);
Fs.readdirSync(Path.join(__dirname, "dump")).filter(js).sort().forEach((filename) => {
  Vm.runInThisContext(Fs.readFileSync(Path.join(__dirname, "dump", filename), "utf8"), {filename});
});
