#!/usr/bin/env node

"use strict";

var GLO = require("../main");
var GE = require("../src/gclasses");

var fs = require("fs");
var minimist = require("minimist");


var args = minimist(process.argv.slice(2), {
  string: ["input", "keyboard"],
  boolean: ["version", "rmfuncat", "rmfuncam", "rmfunctr", "rmfunchm", "rmfuncsyn", "rmfuncef", "rmfunce", "rmfunclog"],
  alias: { 
    v: "version", 
    i: "input", 
    k: "keyboard",
    rmat: "rmfuncat", 
    rmam: "rmfuncam",
    rmtr: "rmfunctr",  
    rmhm: "rmfunchm",  
    rmsyn: "rmfuncsyn",  
    rmef: "rmfuncef",  
    rme: "rmfunce",  
    rmlog: "rmfunclog",  
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


var app = new GLO.GlossaJS();

if (args["rmfuncat"])
  app.removeGlobalFunction('Α_Τ');

if (args["rmfuncam"])
  app.removeGlobalFunction('Α_Μ');

if (args["rmfunctr"])
  app.removeGlobalFunction('Τ_Ρ');

if (args["rmfunchm"])
  app.removeGlobalFunction('ΗΜ');

if (args["rmfuncsyn"])
  app.removeGlobalFunction('ΣΥΝ');

if (args["rmfuncef"])
  app.removeGlobalFunction('ΕΦ');

if (args["rmfunce"])
  app.removeGlobalFunction('Ε');

if (args["rmfunclog"])
  app.removeGlobalFunction('ΛΟΓ');
  
app.setSourceCode(sourceCode);
if (keyboardInput) app.setInputBuffer(keyboardInput);
app.run();

console.log(app.getOutput());
