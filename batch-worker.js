"use strict";

const Instrumentation = require("./instrumentation");
const Status = require("./status.js");
const Run = require("./run.js");

process.on("message", ({mode, test, kind, cache}) => {
  global.setImmediate(loop, test, kind, cache, Instrumentation[kind][global.Symbol.iterator](), (type, abrupt, data) => {
    process.send({
      mode,
      kind,
      type,
      path: test.path,
      abrupt,
      data
    });
  });
});

const loop = (test, kind, cache, iterator, terminate) => {
  const step = iterator.next();
  if (step.done) {
    return terminate("SUCCESS", null, null);
  }
  const instrumentation = step.value;
  if (instrumentation.skip.has(test.path)) {
    return terminate("SKIP", instrumentation.name, null);
  }
  if (instrumentation.name === cache) {
    cache = null;
  }
  if (cache === null) {
    let failure;
    try {
      failure = Run(test, kind, instrumentation.instrumenter);
    } catch (error) {
      return terminate("ERROR", instrumentation.name, {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    if (failure !== null) {
      if (failure.status === Status.DISABLED_FEATURE) {
        return terminate("DISABLED", instrumentation.name, failure.data);
      }
      return terminate("FAILURE", instrumentation.name, failure);
    }
  }
  global.setImmediate(loop, test, kind, cache, iterator, terminate);
};
