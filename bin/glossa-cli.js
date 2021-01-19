#!/usr/bin/env node

"use strict";

var GLO = require("../src/main");
var GE = require("../src/gclasses");

var fs = require("fs");
var minimist = require("minimist");

var prompt = require("prompt-sync")({ echo: "yes" });

var args = minimist(process.argv.slice(2), {
  string: ["input", "output", "keyboard"],
  boolean: ["version", "noninteractive"],
  alias: {
    v: "version",
    i: "input",
    o: "output",
    k: "keyboard",
    non: "noninteractive",
  },
  default: {},
  stopEarly: true /* populate _ with first non-option */,
  unknown: function () {
    //throw new GE.GError("Invalid arguments");
    console.log("Invalid arguments");
    process.exit(1);
  },
});

if (args["version"]) {
  console.log("v0.1");
  process.exit(0);
}

if (!args["input"]) {
  //throw new GE.GError("Missing input file");
  console.log("Missing input file");
  process.exit(1);
}

var sourceCode = null;
try {
  sourceCode = fs.readFileSync(args["input"]).toString();
} catch (e) {
  //throw new GE.GError("Input file not found");
  console.log("Input file not found");
  process.exit(1);
}

var keyboardInput = null;
if (args["keyboard"]) {
  try {
    keyboardInput = fs.readFileSync(args["keyboard"]).toString();
  } catch (e) {
    // throw new GE.GError("Keyboard input file not found");
    console.log("Keyboard input file not found");
    process.exit(1);
  }
}

var errorMsg = "";

(async function main() {
  var app = new GLO.GlossaJS();

  app.setSourceCode(sourceCode);
  app.setDebugMode(false);

  app.setInputBuffer(keyboardInput);

  app.on("outputappend", (data) => {
    errorMsg = data;
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

  try {
    await app.run();

    if (args["output"]) {
      await fs.writeFileSync(args["output"], app.app.getOutput() + errorMsg);
    }
  } catch (e) {
    //console.log(e);
    process.exit(1);
  }

  process.exit(0);
})();
