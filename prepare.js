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
    path,
    attributes,
    content
  };

  const strict = {
    path,
    attributes: Object.assign({}, attributes, {description:attributes.description += " (Strict Mode)"}),
    content: `"use strict";\n${content}`
  };

  if (attributes.flags.raw) {
    return [["raw", normal]];
  }

  if (attributes.flags.module) {
    return [["module", normal]];
  }

  if (attributes.flags.noStrict) {
    return [["normal", normal]];
  }

  if (attributes.strictOnly) {
    return [["strict", strict]];
  }

  return [["normal", normal], ["strict", strict]];

};
