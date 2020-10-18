
const Path = require("path");
const Env = require("./env.js");
const Prepare = require("./prepare.js");
const Run = require("./run.js");

const Aran = require("../aran/lib/index.js");
const Acorn = require("acorn");
const Astring = require("astring");

const aran = new Aran();

const ADVICE_ESTREE = Acorn.parse(`({
  __proto__: null,
  eval: (code, serial) => $262.${Env.ESCAPE_IDENTIFIER}(code, serial)
});`, {ecmaVersion:2020});

const pointcut = ["eval"];

const instrument = (code, serial) => {
  const estree1 = Acorn.parse(code, {ecmaVersion:2020});
  const estree2 = aran.weave(estree1, pointcut, serial);
  const estree3 = {
    type: "Program",
    body: [{
      type: "ExpressionStatement",
      expression: {
        type: "CallExpression",
        optional: false,
        callee: {
          type: "CallExpression",
          optional: false,
          callee: estree2.body[0].expression,
          arguments: [aran.builtin.estree.body[0].expression]
        },
        arguments: [ADVICE_ESTREE.body[0].expression]
      }
    }]
  };
  return Astring.generate(estree3);
};

Prepare(Path.resolve(process.argv[2])).then((tests) => tests.forEach((test) => {
  console.log(test.contents);
  console.log(Run(test, null));
  test = Object.assign(test, {contents: instrument(test.contents, null)});
  console.log(test.contents);
  console.log(Run(test, instrument));
}), (error) => {
  console.log(error);
});
