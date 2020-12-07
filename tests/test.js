"use strict";

const fs = require("fs");
const path = require("path");

const GLO = require("../main.js");

const filename = "../samples-dev/sample10.glo";


var sourceCode = null;
try {
    sourceCode = fs.readFileSync(path.join(__dirname, filename)).toString();
} catch (e) {
    console.log('Το αρχείο δεν βρέθηκε');
    return;
}


var app = new GLO.GlossaJS();
app.setSourceCode(sourceCode);
app.setInputBuffer(null);
app.run();

//console.log('=========================');
console.log(app.getOutput());
//console.log('=========================');
//console.log(app.getOutputDetails());

//console.log('Total commands: ', app.getStats());