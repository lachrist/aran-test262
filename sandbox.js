"use strict";

const Fs = require("fs");
const Instrument = require("./instrument.js");

Instrument.reset(process.argv[2]);
global.$262 = {};
global.eval(Instrument.instrument(Fs.readFileSync(process.argv[3], "utf8"), null));
