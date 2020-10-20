"use strict";

const Fs = require("fs");
const Path = require("path");

// const readdir = async function* readdir(parent) {
//   for await (const dirent of await Fs.promises.opendir(parent)) {
//     const child = Path.join(parent, dirent.name);
//     if (dirent.isDirectory()) {
//       yield* readdir(child);
//     } else if (!/annexB|intl402|_FIXTURE/.test(child)) {
//       yield child;
//     }
//   }
// };

// const readdir = readdir(path, callback) {
//   Fs.lstat(path, (error, stat) => {
//     if (error) {
//       throw error;
//     }
//     if (stat.isDirectory()) {
//       Fs.readdir(path, (error, filenames) => {
//         if (error) {
//           throw error;
//         }
//         for (let filename of filenames) {
//           readdir(Path.join(path, filename), callback);
//         }
//       });
//     } else if (!/annexB|intl402|_FIXTURE/.test(path)) {
//       callback(path);
//     }
//   });
// };

const readdir = (path, callback) => {
  if (Fs.lstatSync(path).isDirectory()) {
    for (let filename of Fs.readdirSync(path).sort()) {
      readdir(Path.join(path, filename), callback);
    }
  } else if (/\.js$/.test(path) && !/annexB|intl402|_FIXTURE/.test(path)) {
    callback(path);
  }
};

module.exports = readdir;
