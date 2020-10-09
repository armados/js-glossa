"use strict";

var fs = require("fs");
var path = require("path");

var GlossaJS = require("../app.js");

var filename = "../samples/sample7.glo";
var sourceCode = fs.readFileSync(path.join(__dirname, filename)).toString();

var inputKeyboardBuffer = null;
var output = GlossaJS.parseGlossaJS(sourceCode, inputKeyboardBuffer);

console.log(output);
