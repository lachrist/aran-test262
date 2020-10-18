
const Path = require("path");
const Env = require("./env.js");
const Prepare = require("./prepare.js");
const Run = require("./run.js");

Prepare(Path.resolve(process.argv[2])).then((tests) => tests.forEach((test) => {
  console.log(test.contents);
  console.log(Run(test, null));
  // test = Object.assign(test, {contents: instrument(test.contents, null)});
  // console.log(test.contents);
  // console.log(Run(test, instrument));
}), (error) => {
  console.log(error);
});
