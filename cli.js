#!/usr/bin/env node

"use strict";

var GLO = require("./main");

var GE = require("./src/gclasses");

var fs = require("fs");

var minimist = require("minimist");

//FIXME:
var args = minimist(process.argv.slice(2), {
  string: ["input"],
  string: ["keyboard"],
  boolean: ["version"],
  alias: { v: "version", i: "input", k: "keyboard" },
  default: {},
  stopEarly: true /* populate _ with first non-option */,
  unknown: function () {
    throw new GE.GError("Invalid arguments");
  },
});

if (!args["input"]) throw new GE.GError("Missing input file");

var sourceCode = null;
try {
  sourceCode = fs.readFileSync(args["input"]).toString();
} catch (e) {
  throw new GE.GError("Input file not found");
}



var pr1 = new GLO.GlossaJS();
pr1.setSourceCode(sourceCode);
if (args["keyboard"]) pr1.setInputBuffer(args["keyboard"]);
var output = pr1.run();


console.log(output);
