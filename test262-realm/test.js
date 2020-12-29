"use strict";
const Path = require("path");
const Fs = require("fs");
const Engine262 = require(Path.join("..", "node_modules", "@engine262", "engine262", "dist", "engine262.js"));
const Test262Realm = require("./index.js");

Engine262.setSurroundingAgent(new Engine262.Agent({features:[]}));

const realm = Test262Realm({
  success: () => { console.log(`success`); },
  failure: (message) => { console.log(`failure >> ${message}`); },
  instrument: {
    script: (code, specifier) => {
      console.log(`module >> ${specifier} >> ${code}`);
      return code;
    },
    module: (code, specifier) => {
      console.log(`module >> ${specifier} >> ${code}`);
      return code;
    },
    eval: (code, location, specifier) => {
      console.log(`eval >> ${specifier} >> ${location} >> ${code}`);
      return code;
    }
  }
});

const specifier = Path.join(__dirname, "script.js");
// console.log(Fs.readFileSync(specifier, "utf8"));
realm.scope(() => {
  const completion = realm.evaluateScript(Fs.readFileSync(specifier, "utf8"), {specifier});
  console.log(Engine262.inspect(completion));
});
