#!/usr/bin/env node --max_old_space_size=800

"use strict";

var GlossaJS = require("./app");

var GE = require("./src/gclasses");

var fs = require("fs");
var minimist = require("minimist");

//FIXME:
var args = minimist(process.argv.slice(2), {
  string: ["input"], // --lang xml
  string: ["keyboard"], // --lang xml
  boolean: ["version"], // --version
  alias: { v: "version", i: "input", k: "keyboard" },
  default: {},
  stopEarly: true /* populate _ with first non-option */,
  unknown: function () {
    throw new GE.GError("Invalid arguments");
  },
});

if (!args["input"]) throw new GE.GError("Missing input file");

var filename = args["input"];
var sourceCode = fs.readFileSync(filename).toString();

var inputKeyboardBuffer = null;
if (args["keyboard"]) inputKeyboardBuffer = args["keyboard"];

var output = GlossaJS.parseGlossaJS(sourceCode, inputKeyboardBuffer);

console.log(output);
