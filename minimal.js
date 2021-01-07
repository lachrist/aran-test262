"use strict";

const Vm = require("vm");
const Path = require("path");
const Minimist = require("minimist");
const Fs = require("fs");
const Util = require("util");
const Instrumentation = require("./instrumentation");
const Engine262 = require(Path.join(__dirname, "node_modules", "@engine262", "engine262", "dist", "engine262.js"));
const Test262Realm = require("./test262-realm");

const argv = Minimist(process.argv.slice(2));

const options = /^(?<id>[0-9]+)-(?<mode>[a-z]+)-(?<kind>[a-z]+)-(?<instrumentation>[a-z]+).js$/.exec(Path.basename(argv.target)).groups;

const test = {
  path: Path.resolve(process.cwd(), argv.target),
  source: options.mode === "module" ? "module" : "script", 
  content: Fs.readFileSync(argv.target, "utf8")
};

if (options.mode === "strict") {
  test.content = `"use strict"; ${test.content}`;
}

const instrumentation = Instrumentation[options.kind].find((instrumentation) => instrumentation.name === options.instrumentation);

let instrument = instrumentation.instrumenter();

if (global.Reflect.getOwnPropertyDescriptor(argv, "dump")) {
  let counter = 0;
  const raw = instrument;
  const prefix = Path.basename(argv.target, ".js");
  const pathof = (stage) => Path.join(argv.dump, `${prefix}-${global.String(counter).padStart(4, "0")}-${stage}.js`);
  const locate = (code, source, rest) => `// ${source} ${rest.map(global.String).join("-")} original${"\n"}${code}`;
  const dump = (source) => (code, ...rest) => {
    counter++;
    Fs.writeFileSync(pathof("1"), locate(code, source, rest), "utf8");
    debugger;
    code = raw[source](code, ...rest);
    Fs.writeFileSync(pathof("2"), locate(code, source, rest), "utf8");
    return code;
  };
  Fs.writeFileSync(Path.join(argv.dump, "_setup_.js"), raw.setup, "utf8");
  instrument = {
    setup: raw.setup,
    script: dump("script"),
    module: dump("module"),
    eval: dump("eval")
  };
}

if (global.Reflect.getOwnPropertyDescriptor(argv, "host") === global.undefined || argv.host.includes("node")) {
  
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
      if (options.kind === "inclusive") {
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
  debugger;
  Vm.runInThisContext(instrument.script(test.content, test.path), {filename:test.path});

  delete global.print;
  delete global.$262;

}

if (global.Reflect.getOwnPropertyDescriptor(argv, "host") === global.undefined || argv.host.includes("engine262")) {
  
  console.log("engine262");

  Engine262.setSurroundingAgent(new Engine262.Agent({features:[]}));

  const modules = new Map();

  const realm = Test262Realm({
    instrument: options.kind === "exclusive" ? {
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
      completion = realm.createSourceTextModule(test.path, instrument.module(test.content, test.path));
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
      completion = realm.evaluateScript(instrument.script(test.content, test.path), {specifier:test.path});
    }
    console.log(Engine262.inspect(completion));
  });
  
}
