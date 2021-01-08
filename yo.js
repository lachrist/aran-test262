const code1 = "'use\\u0020strict';";
const estree1 = require("acorn").parse(code1, {ecmaVersion:2020});
const code2 = require("escodegen").generate(estree1);
console.log(code2) // prints "'use strict';" instead of "'use\\u0020strict';"