const Engine262 = require("./engine262/dist/engine262.js");
const Engine262Test262Realm = require("./engine262/bin/test262_realm.js");
const Vm = require("vm");

const setup = ``;

const body = `this.Reflect.apply(this.BigInt.asIntN, this.BigInt, [0, 0n]);`;

Engine262.setSurroundingAgent(new Engine262.Agent({features:[]}));

const test262realm = Engine262Test262Realm.createRealm();
test262realm.realm.scope(() => {
  const completion1 = test262realm.realm.evaluateScript(setup, {specifier:"setup.js"});
  console.log(Engine262.inspect(completion1));
  const completion2 = test262realm.realm.evaluateScript(body, {specifier:"body.js"});
  console.log(Engine262.inspect(completion2));
});

Vm.runInThisContext(setup, {filename:"setup.js"});
Vm.runInThisContext(body, {filename:"body.js"});

console.log("done");
