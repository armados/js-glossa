#!/usr/bin/env node

"use strict";

var GLO = require("../src/main");
var GE = require("../src/gclasses");

var fs = require("fs");
var minimist = require("minimist");

var prompt = require("prompt-sync")({ echo: "yes" });

const { PerformanceObserver, performance } = require("perf_hooks");

const obs = new PerformanceObserver((items) => {
  console.log(items.getEntries()[0].duration);
  performance.clearMarks();
});
obs.observe({ entryTypes: ["measure"], buffer: true });

var args = minimist(process.argv.slice(2), {
  string: ["input", "keyboard"],
  boolean: [
    "version",
    "noninteractive",
    "rmfuncat",
    "rmfuncam",
    "rmfunctr",
    "rmfunchm",
    "rmfuncsyn",
    "rmfuncef",
    "rmfunce",
    "rmfunclog",
  ],
  alias: {
    v: "version",
    i: "input",
    k: "keyboard",
    non: "noninteractive",
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
  console.log("v0.1");
  return;
}

if (!args["input"]) throw new GE.GError("Missing input file");

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

(async function main() {
  var app = new GLO.GlossaJS();
  app.setSourceCode(sourceCode);
  app.setInputBuffer(keyboardInput);

  app.on("outputappend", (data) => {
    console.log(data);
  });

  app.on("error", (msg) => {
    console.log(msg);
  });

  if (!args["noninteractive"]) {
    app.setReadInputFunction(function (name) {
      return prompt();
    });
  }

  performance.mark("app-start");
  try {
    await app.run();
  } catch (e) {}

  performance.mark("app-end");
  performance.measure("apprun", "app-start", "app-end");

  console.log("=======[ output buffer ] ========");
  console.log(app.app.getOutput());

  console.log("=======[ stats ] ========");
  console.log("Total commands: ", app.getStats());
})();
