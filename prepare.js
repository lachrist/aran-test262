"use strict";

const Path = require("path");
const Fs = require("fs");
const JsYaml = require("js-yaml");
const Env = require("./env.js");

module.exports = async (path) => {

  const content = await Fs.promises.readFile(path, "utf8");

  const yamlStart = content.indexOf("/*---") + 5;

  const yamlEnd = content.indexOf("---*/", yamlStart);

  const yaml = content.slice(yamlStart, yamlEnd);

  const attributes = JsYaml.load(yaml);

  attributes.flags = (attributes.flags || []).reduce((acc, c) => {
    acc[c] = true;
    return acc;
  }, {});

  attributes.includes = attributes.includes || [];

  const normal = {
    path,
    attributes,
    content
  };

  const strict = {
    path,
    attributes: Object.assign({}, attributes, {description:attributes.description += " (Strict Mode)"}),
    content: `"use strict";\n${content}`
  };

  const tests = [];

  if (attributes.flags.raw || attributes.flags.module || attributes.flags.noStrict) {
    return [normal];
  }

  if (attributes.strictOnly) {
    return [strict];
  }

  return [normal, strict];

};