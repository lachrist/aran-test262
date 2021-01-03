"use strict";

const Path = require("path");
const Fs = require("fs");
const JsYaml = require("js-yaml");

const accumulator = (object, flag) => {
  object[flag] = true;
  return object;
};

module.exports = (path, map) => {
  const content = Fs.readFileSync(path, "utf8");
  const yamlStart = content.indexOf("/*---") + 5;
  const yamlEnd = content.indexOf("---*/", yamlStart);
  const yaml = content.slice(yamlStart, yamlEnd);
  const attributes = JsYaml.load(yaml);
  attributes.flags = (attributes.flags || []).reduce(accumulator, {});
  attributes.includes = attributes.includes || [];
  const raw = {
    attributes,
    content
  };
  const cooked_use_strict = {
    attributes: Object.assign({}, attributes, {
      description: `${attributes.description} (Strict Mode)`
    }),
    content: `"use strict";\n${content}`
  };
  if (attributes.flags.raw) {
    return {
      raw: raw
    };
  }
  if (attributes.flags.module) {
    return {
      module: raw
    };
  }
  if (attributes.flags.noStrict) {
    return {
      normal: raw
    };
  }
  if (attributes.flags.onlyStrict) {
    return {
      strict: cooked_use_strict
    };
  }
  return {
    normal: raw,
    strict: cooked_use_strict
  };
};
