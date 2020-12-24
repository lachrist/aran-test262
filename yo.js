const args = (function(a, a, a) { return arguments; })(1, 2, 3);
args[Symbol.isConcatSpreadable] = true;
console.log([].concat(args, args));
