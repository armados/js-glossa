"use strict";

const fs = require("fs");
const path = require("path");

const GLO = require("../src/main.js");

const filename = "../samples-dev/sample24.glo";

(async function main() {

  try {
    var sourceCode = fs.readFileSync(path.join(__dirname, filename)).toString();
  } catch (e) {
    console.log("Σφάλμα. Το αρχείο δεν βρέθηκε.");
    return;
  }

  var app = new GLO.GlossaJS();
  app.setSourceCode(sourceCode);
  app.setInputBuffer(null);
  await app.run();

  //console.log("=========================");
  //console.log(app.getOutput());
  //console.log('=========================');
  //console.log(app.getOutputDetails());

  //console.log('Total commands: ', app.getStats());
})();
