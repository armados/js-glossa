"use strict";

var fs = require("fs");
var path = require("path");

var GlossaJS = require("../app.js");

var filename = "../samples/sample9.glo";
var sourceCode = fs.readFileSync(path.join(__dirname, filename)).toString();

var inputKeyboardBuffer = "\'nikos\'";
var output = GlossaJS.parseGlossaJS(sourceCode, inputKeyboardBuffer);

console.log(output);
