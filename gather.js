"use strict";

const Fs = require("fs");
const Path = require("path");

const readdir = async function* readdir(parent) {
  for await (const dirent of await Fs.promises.opendir(parent)) {
    const child = Path.join(parent, dirent.name);
    if (dirent.isDirectory()) {
      yield* readdir(child);
    } else if (!/annexB|intl402|_FIXTURE/.test(child)) {
      yield child;
    }
  }
};

module.exports = readdir;
