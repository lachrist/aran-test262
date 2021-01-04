"use strict";

const Fs = require("fs");
const Path = require("path");

const readdir = function * (path) {
  if (Fs.lstatSync(path).isDirectory()) {
    for (let filename of Fs.readdirSync(path).sort()) {
      yield* readdir(Path.join(path, filename));
    }
  } else if (/\.js$/.test(path) && !/annexB|intl402|_FIXTURE/.test(path)) {
    yield path;
  }
};

module.exports = readdir;
