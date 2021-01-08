"use strict";

const Fs = require("fs");
const Path = require("path");
const Util = require("util");

console.log("");

for (let filename of Fs.readdirSync(Path.join(__dirname, "highlight"))) {
  Fs.unlinkSync(Path.join(__dirname, "highlight", filename));
}

const skips = new global.Set();

const database = new global.Map(global.JSON.parse(Fs.readFileSync(process.stdin.fd, "utf8")));
const home = database.get("HOME");
for (let [key, value] of database.entries()) {
  if (key !== "CURRENT" && key !== "HOME") {
    if (value.type !== "SKIP" && value.type !== "DISABLED") {
      skips.add(Path.relative(Path.join("/", "test262", "test"), Path.join("/", home, value.specifier)));
      const path = Path.resolve(__dirname, home, value.specifier);
      console.log("");
      console.log(`key  >> ${key}`);
      console.log(`path >> ${path}`);
      console.log(`type >> ${value.type}`);
      console.log(`name >> ${value.abrupt}`);
      if (value.type === "ERROR") {
        console.log(value.data.stack);
      } else if (value.type === "FAILURE") {
        console.log(`code >> ${value.data.status}`);
        if (value.data.data !== null) {
          console.log(`data >> ${value.data.data}`);
        }
        if (value.data.completion !== null) {
          console.log(`comp >> ${value.data.completion}`);
        }
      } else {
        throw new global.RangeError("Invalid type");
      }
      Fs.writeFileSync(Path.join(__dirname, "highlight", `${key}-${value.abrupt}.js`), Fs.readFileSync(path, "utf8"), "utf8");
    }
  }
}

for (const skip of skips) {
  console.log(skip);
}

