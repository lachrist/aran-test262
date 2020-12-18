
const Path = require("path");
const Fs = require("fs");
const Env = require("./env.js");
const Prepare = require("./prepare.js");

const test = new Map(Prepare(Path.resolve(process.argv[2]))).get(process.argv[3]);

if (process.argv[3] === "strict") {
  process.stdout.write("\"use strict\";\n");
}

process.stdout.write("// Mock $262 //\n");
process.stdout.write("var $262 = {};");

process.stdout.write("\n\n// Prelude //\n");
process.stdout.write(Fs.readFileSync(Path.join(__dirname, "prelude.js"), "utf8"), "utf8");

test.attributes.includes.unshift("assert.js", "sta.js");

if (test.attributes.flags.async) {
  test.attributes.includes.unshift("doneprintHandle.js");
}

for (let include of test.attributes.includes) {
  process.stdout.write("\n\n// Include " + include + "//\n");
  process.stdout.write(Fs.readFileSync(Path.join(Env.TEST262, "harness", include), "utf8"), "utf8");
}

process.stdout.write("\n\n// Content //\n");
process.stdout.write(test.content);
