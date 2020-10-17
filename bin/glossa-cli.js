#!/usr/bin/env node

"use strict";

var GLO = require("../main");
var GE = require("../src/gclasses");

var fs = require("fs");
var minimist = require("minimist");

//FIXME:
var args = minimist(process.argv.slice(2), {
  string: ["input", "keyboard"],
  boolean: ["version", "rmfuncat", "rmfuncam", "rmfunctr"],
  alias: { 
    v: "version", 
    i: "input", 
    k: "keyboard",
    rmat: "rmfuncat", 
    rmam: "rmfuncam",
    rmtr: "rmfunctr",  
  },
  default: {},
  stopEarly: true /* populate _ with first non-option */,
  unknown: function () {
    throw new GE.GError("Invalid arguments");
  },
});

if (args["version"]) {
  console.log('0.0.1');
  return;
}


if (!args["input"])
  throw new GE.GError("Missing input file");

var sourceCode = null;
try {
  sourceCode = fs.readFileSync(args["input"]).toString();
} catch (e) {
  throw new GE.GError("Input file not found");
}

var keyboardInput = null;
if (args["keyboard"]) {
  try {
    keyboardInput = fs.readFileSync(args["keyboard"]).toString();
  } catch (e) {
    throw new GE.GError("Keyboard input file not found");
  }
}


var pr1 = new GLO.GlossaJS();

if (args["removeAT"])
  pr1.removeGlobalFunction('Α_Τ');

if (args["removeAM"])
  pr1.removeGlobalFunction('Α_Μ');

if (args["removeATP"])
  pr1.removeGlobalFunction('Τ_Ρ');

pr1.setSourceCode(sourceCode);
if (keyboardInput) pr1.setInputBuffer(keyboardInput);
pr1.run();

console.log(pr1.getOutput());
