"use strict";

const Path = require("path");
const Fs = require("fs");
const JsYaml = require("js-yaml");
const Env = require("./env.js");

module.exports = async (file) => {

  const contents = await Fs.promises.readFile(file, "utf8");

  const yamlStart = contents.indexOf("/*---") + 5;

  const yamlEnd = contents.indexOf("---*/", yamlStart);

  const yaml = contents.slice(yamlStart, yamlEnd);

  const attrs = JsYaml.load(yaml);

  attrs.flags = (attrs.flags || []).reduce((acc, c) => {
    acc[c] = true;
    return acc;
  }, {});

  attrs.includes = attrs.includes || [];

  const normal = {
    file: Path.relative(Env.TEST262, file),
    attrs,
    contents
  };

  const strict = {
    file: Path.relative(Env.TEST262, file),
    attrs: Object.assign({}, attrs, {description:attrs.description += " (Strict Mode)"}),
    contents: `"use strict";\n${contents}`
  };

  const tests = [];

  if (attrs.flags.raw || attrs.flags.module || attrs.flags.noStrict) {
    return [normal];
  }

  if (attrs.strictOnly) {
    return [strict];
  }

  return [normal, strict];

};
