"use strict";

const CheckError = function CheckError () {};
CheckError.prototype = {
  __proto__: global.Error,
  constructor: CheckError
};
exports.CheckError = CheckError;

const check = (node) => {
  if (node.type === "FunctionExpression" || node.type === "FunctionDeclaration" || node.type === "ArrowFunctionExpression") {
    if (node.async) {
      return "aync";
    }
    if (node.generator) {
      return "generator";
    }
    return null;
  }
  if (node.type === "ForOfStatement") {
    if (node.await) {
      return "await-for-of";
    }
    return null;
  }
  if (node.type === "AwaitExpression") {
    return "await";
  }
  if (node.type === "YieldExpression") {
    return "yield";
  }
  return null;
};

const loop = (parent) => {
  if (typeof parent === "object" && parent !== null) {
    if (typeof parent.type === "string") {
      const reason = check(parent);
      if (reason !== null) {
        return reason;
      }
    }
    for (let child of global.Array.isArray(parent) ? parent : global.Object.values(parent)) {
      const reason = loop(child);
      if (reason !== null) {
        return reason;
      }
    }
  }
  return null;
};

exports.check = (node) => {
  const reason = loop(node);
  if (reason !== null) {
    throw new CheckError(reason);
  }
};
