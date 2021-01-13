"use strict";

const fs = require("fs");
const path = require("path");

const GLO = require("../src/main.js");

var prompt = require("prompt-sync")();

const filename = "../samples-dev/sample1.glo";

const { PerformanceObserver, performance } = require("perf_hooks");

const obs = new PerformanceObserver((items) => {
  console.log(items.getEntries()[0].duration);
  performance.clearMarks();
});
obs.observe({ entryTypes: ["measure"], buffer: true });

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

  app.on("error", (msg) => {
    console.log(msg);
  });

  app.setReadInputFunction(function (name) {
    return prompt();
  });

  performance.mark("app-start");
  try {
    await app.run();
  } catch (e) {}

  performance.mark("app-end");
  performance.measure("apprun", "app-start", "app-end");

  //console.log('=======[ output buffer ] ========');
  //console.log(app.app.getOutput());

  console.log('=======[ stats ] ========');
  console.log('Total commands: ', app.getStats());



})();
