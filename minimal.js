"use strict";

const Vm = require("vm");
const Path = require("path");
const Fs = require("fs");
const Util = require("util");
const Minimist = require("minimist");
const Instrumentation = require("./instrumentation");
const Engine262 = require(Path.join(__dirname, "node_modules", "@engine262", "engine262", "dist", "engine262.js"));
const Test262Realm = require("./test262-realm");

const argv = Minimist(process.argv.slice(2));

const test = {
  path: Path.resolve(process.cwd(), argv.target),
  source: argv.target.endsWith(".mjs") ? "module" : "script", 
  content: Fs.readFileSync(argv.target, "utf8")
};

const path = Path.resolve(process.cwd(), argv.target);

const target = Fs.readFileSync(path, "utf8");

const instrumentation = Instrumentation[argv.kind].find((instrumentation) => instrumentation.name === argv.instrumentation);

const instrument = instrumentation.instrumenter();

if (!("host" in argv) || argv.host.includes("node")) {
  
  console.log("node");

  global.print = (...values) => {
    console.log(...values.map((value) => Util.inspect(value)));
  };

  global.$262 = {
    createRealm () {
      throw new global.Error("$262.createRealm() not implemented");
    },
    detachArrayBuffer () {
      throw new global.Error("$262.detachArrayBuffer() not implemented");
    },
    evalScript (code, specifier) {
      if (process.argv[3] === "inclusive") {
        code = instrument.script(code, specifier);
      }
      return Vm.runInThisContext(code, {filename:specifier});
    },
    gc () {
      throw new global.Error("$262.gc() not implemented");
    },
    global: global,
    get agent () {
      throw new global.Error("262.agent not implemented");
    },
    instrument: instrument.eval
  };

  Vm.runInThisContext(instrument.setup, {filename:"setup.js"});

  Vm.runInThisContext(instrument.script(target, process.argv[2]), {filename:process.argv[2]});

  delete global.print;
  delete global.$262;

}

if (!("host" in argv) || argv.host.includes("engine262")) {
  
  console.log("engine262");

  Engine262.setSurroundingAgent(new Engine262.Agent({features:[]}));

  const modules = new Map();

  const realm = Test262Realm({
    instrument: argv.kind === "exclusive" ? {
      setup: instrument.setup,
      script: (code) => code,
      module: (code) => code,
      eval: instrument.eval
    } : instrument,
    modules
  });

  realm.scope(() => {
    let completion;
    if (test.source === "module") {
      completion = realm.createSourceTextModule(test.path, instrument.module(target, test.path));
      if (!(completion instanceof Engine262.AbruptCompletion)) {
        const module = completion;
        modules.set(test.path, module);
        completion = module.Link();
        if (!(completion instanceof Engine262.AbruptCompletion)) {
          completion = module.Evaluate();
        }
        if (!(completion instanceof Engine262.AbruptCompletion)) {
          if (completion.PromiseState === "rejected") {
            completion = Engine262.Throw(completion.PromiseResult);
          }
        }
      }
    } else {
      completion = realm.evaluateScript(instrument.script(target, test.path), {specifier:test.path});
    }
    console.log(Engine262.inspect(completion));
  });
  
}
