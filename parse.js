"use strict";

const Path = require("path");
const Fs = require("fs");
const JsYaml = require("js-yaml");

module.exports = (path) => {
  const content = Fs.readFileSync(path, "utf8");
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
    __proto__: null,
    path,
    attributes,
    content
  };
  const strict = {
    __proto__: null,
    path,
    attributes: Object.assign({}, attributes, {
      description: `${attributes.description} (Strict Mode)`
    }),
    content: `"use strict";\n${content}`
  };
  if (attributes.flags.raw) {
    return [{
      __proto__: normal,
      mode: "raw"
    }];
  }
  if (attributes.flags.module) {
    return [{
      __proto__: normal,
      mode: "module"
    }];
  }
  if (attributes.flags.noStrict) {
    return [{
      __proto__: normal,
      mode: "normal"
    }];
  }
  if (attributes.flags.onlyStrict) {
    return [{
      __proto__: strict,
      mode: "strict"
    }];
  }
  return [{
    __proto__: normal,
    mode: "strict"
  }, {
    __proto__: strict,
    mode: "strict"
  }];
};
