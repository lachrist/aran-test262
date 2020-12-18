var Test262Error = class Test262Error extends Error {};
Test262Error.thrower = (...args) => {
  throw new Test262Error(...args);
};

function $DONE(error) {
  if (error) {
    if (typeof error === "object" && error !== null && "stack" in error) {
      __consolePrintHandle__("Test262:AsyncTestFailure:" + error.stack);
    } else {
      __consolePrintHandle__("Test262:AsyncTestFailure:Test262Error: " + error);
    }
  } else {
    __consolePrintHandle__("Test262:AsyncTestComplete");
  }
}
