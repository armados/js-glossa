"use strict";

const fs = require("fs");
const path = require("path");

const GLO = require("../src/main.js");

const prompt = require("prompt-sync")();

const filename = "../samples-dev/sample32.glo";

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

  app.on("outputappend", (data) => {
    console.log(data);
  });

  app.on("error", (data) => {
    console.log(data);
  });

  app.setReadInputFunction(function (name) {
    return prompt();
  });

  try {
    await app.run();
  } catch (e) {}

  //console.log('=======[ output buffer ] ========');
  //console.log(app.app.getOutput());

  //console.log("=======[ stats ] ========");
  //console.log("Total commands: ", app.getStats());
})();
