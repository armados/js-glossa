#!/usr/bin/env node

"use strict";


var GLO = require("../src/main");

var fs = require("fs");
var minimist = require("minimist");
var chardet = require("chardet");

var prompt = require("prompt-sync")({ echo: "yes" });

var args = minimist(process.argv.slice(2), {
  string: ["input", "output", "keyboard"],
  boolean: ["help", "noninteractive"],
  alias: {
    h: "help",
    i: "input",
    o: "output",
    k: "keyboard",
    n: "noninteractive"
  },
  default: {},
  stopEarly: true /* populate _ with first non-option */,
  unknown: function () {
    console.log("Δεν δηλώθηκαν αποδεκτοί παράμετροι εκτέλεσης του διερμηνευτή.");
    console.log("");
    console.log("Εκτελέστε ξανά τον διερμηνευτή με την παράμετρο -h για προβολή του βοηθητικού μηνύματος χρήσης του διερμηνευτή.");
    console.log("");
    process.exit(1);
  },
});


if (args["help"]) {
  console.log("Διερμηνευτής της ΓΛΩΣΣΑΣ JS");
  console.log("");
  console.log("Χρήση: glossa-cli -i <όνομα αρχείου που περιέχει το πηγαίο πρόγραμμα>");
  console.log("");
  console.log("  Παράμετροι:");
  console.log("");
  console.log("  -h, --help\t\t\tΑυτό το βοηθητικό μήνυμα");
  console.log("  -i, --input\t\t\tΌνομα αρχείου που περιέχει το πηγαίο πρόγραμμα (υποχρεωτική παράμετρος)");
  console.log("  -ο, --output\t\t\tΌνομα αρχείου για την αποθήκευση της εξόδου του προγράμματος");
  console.log("  -k, --keyboard\t\tΌνομα αρχείου που περιέχει τις τιμές εισόδου του προγράμματος");
  console.log("  -n, --noninteractive\t\tΕκτέλεση του διερμηνευτή σε μη διαδραστική λειτουργία");
  console.log("");
  console.log("  Happy Coding! :)");
  console.log("");
  process.exit(0);
}

if (!args["input"]) {
  console.log("Σφάλμα. Δεν έχει δηλωθεί το όνομα του αρχείου που περιέχει το πηγαίο πρόγραμμα.");
  console.log("");
  console.log("Εκτελέστε ξανά τον διερμηνευτή με την παράμετρο -h για προβολή του βοηθητικού μηνύματος χρήσης του διερμηνευτή.");
  console.log("");
  process.exit(1);
}

var sourceCode = null;
try {

  const encoding = chardet.detectFileSync(args["input"]);

  sourceCode = fs.readFileSync(args["input"], {encoding: encoding}).toString();

  if (sourceCode.charCodeAt(0) === 0xFEFF) {
    sourceCode = sourceCode.substr(1);
  }

} catch (e) {
  console.log("Σφάλμα. Το αρχείο του πηγαίου προγράμματος που δηλώθηκε δεν βρέθηκε.");
  console.log("");
  process.exit(1);
}

var keyboardInput = null;
if (args["keyboard"]) {

  if (!fs.existsSync(args["keyboard"])) {
    console.log("Σφάλμα. Το αρχείο που περιέχει τις τιμές εισόδου του προγράμματος δεν βρέθηκε.");
    console.log("");
    process.exit(1);
  }

  try {  
  const encoding = chardet.detectFileSync(args["keyboard"]);

  keyboardInput = fs.readFileSync(args["keyboard"], {encoding: encoding}).toString();

  if (keyboardInput.charCodeAt(0) === 0xFEFF) {
    keyboardInput = keyboardInput.substr(1);
  }

  } catch (e) {
    keyboardInput=null;
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
