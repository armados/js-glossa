"use strict";

const fs = require("fs");
const path = require("path");

const GLO = require("../../src/main.js");

const prompt = require("prompt-sync")();

const filename = "../../samples/sample42.glo";

(async function main() {
  try {
    var sourceCode = fs.readFileSync(path.join(__dirname, filename)).toString();
  } catch (e) {
    console.log("Σφάλμα. Το αρχείο δεν βρέθηκε.");
    return;
  }

  var app = new GLO.GlossaJS();

  app.setSourceCode(sourceCode);
  app.setDebugMode(false);
  app.setInputBuffer(null);

  app.setReadInputFunction(function (name) {
    return prompt();
  });

  app.on("outputappend", (data) => {
    console.log(data);
  });
//  app.on("inputread", (data) => {
//    console.log("\x1b[33m" + data + "\x1b[0m");
//  });
  app.on("error", (data) => {
    console.log(data);
  });

  await app.run();

  console.log("=======[ Μετρητές ] ========");
  console.log("Total commands: ", app.getCounters().getAllCountersArray());
})();
