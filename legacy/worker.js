"use strict";

const Util = require("util");
const Run = require("./run.js");

let p = Promise.resolve();

const handleSendError = (e) => {
  if (e) {
    process.exit(1);
  }
};

process.on("message", (test) => {
  if (test === "DONE") {
    p.then(() => process.exit(0));
    p = undefined;
  } else {
    const description = `${test.file}\n${test.attrs.description}`;
    p = p
      .then(() => Run(test))
      .then((r) => {
        process.send({ description, ...r }, handleSendError);
      })
      .catch((e) => {
        process.send({ description, status: "FAIL", error: Util.inspect(e) }, handleSendError);
      });
  }
});
