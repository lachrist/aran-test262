"use strict";

const Path = require("path");
const Fs = require("fs");
const JsYaml = require("js-yaml");

const accumulator = (object, flag) => {
  object[flag] = true;
  return object;
};

module.exports = (path) => {
  const content = Fs.readFileSync(path, "utf8");
  const yamlStart = content.indexOf("/*---") + 5;
  const yamlEnd = content.indexOf("---*/", yamlStart);
  const yaml = content.slice(yamlStart, yamlEnd);
  const attributes = JsYaml.load(yaml);
  attributes.flags = (attributes.flags || []).reduce(accumulator, {});
  attributes.includes = attributes.includes || [];
  if (attributes.flags.raw) {
    return [{
      mode: "raw",
      test: {
        path,
        source: "script",
        attributes,
        content
      }
    }];
  }
  if (attributes.flags.module) {
    return [{
      mode: "module",
      test: {
        path,
        source: "module",
        attributes,
        content
      }
    }];
  }
  const normal = {
    mode: "normal",
    test: {
      path,
      mode: "normal",
      source: "normal",
      attributes,
      content
    }
  };
  const strict = {
    mode: "strict",
    test: {
      path,
      source: "script",
      attributes: Object.assign({}, attributes, {
        description: `${attributes.description} (Strict Mode)`
      }),
      content: `"use strict";\n${content}`
    }
  };
  if (attributes.flags.noStrict) {
    return [normal];
  }
  if (attributes.flags.onlyStrict) {
    return [strict];
  }
  return [normal, strict];
};
