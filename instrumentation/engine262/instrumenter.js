"use strict";

module.exports = () => ({
  setup: null,
  script: (code, specifier) => code,
  module: (code, specifier) => code,
  eval: (code, location, specifier) => {
    throw new global.Error(`$262.instrument should never be called`);
  }
});
