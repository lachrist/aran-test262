"use strict";

const Fs = require("fs");
const Path = require("path");
const Util = require("util");

const counter = process.argv.length > 2 ? global.parseInt(process.argv[2]) : 0;

for (let [key, value] of global.JSON.parse(Fs.readFileSync(process.stdin.fd, "utf8"))) {
  if (key !== "CURRENT") {
    if (value.type !== "SKIP" && value.type !== "DISABLED") {
      process.stderr.write(key + "\n", "utf8");
      process.stderr.write(value.path + "\n", "utf8");
      process.stderr.write(value.type + "\n", "utf8");
      process.stderr.write(value.abrupt + "\n", "utf8");
      if (value.type === "ERROR") {
        process.stderr.write(value.data.stack + "\n", "utf8");
      } else if (value.type === "FAILURE") {
        process.stderr.write(value.data.status + "\n", "utf8");
        if (value.data.data !== null) {
          process.stderr.write(value.data.data + "\n", "utf8");
        }
        if (value.data.completion !== null) {
          process.stderr.write(value.data.completion + "\n", "utf8");
        }
      } else {
        throw new global.Error("Out of range type");
      }
      Fs.createReadStream(Path.join(__dirname, "test262", "test", value.path)).pipe(process.stdout);
      break;
    }
  }
}
