({
  __proto__: null,
  eval: (value, perform, serial) => perform(
    (
      typeof code === "string" ?
      $262.__instrument__(code, "eval", serial, "direct-eval-call") :
      code))});
