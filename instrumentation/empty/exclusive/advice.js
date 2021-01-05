((instrinsics) => ({
  __proto__: null,
  eval: (value, perform, serial) => perform(
    (
      typeof value === "string" ?
      $262.instrument(value, serial, "direct-eval-call") :
      value))}))
