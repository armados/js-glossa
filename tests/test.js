"use strict";

var fs = require("fs");
var path = require("path");

var GLO = require("../main.js");

var filename = "../samples-dev/sample2.glo";
var sourceCode = fs.readFileSync(path.join(__dirname, filename)).toString();

var pr1 = new GLO.GlossaJS();

pr1.setSourceCode(sourceCode);
pr1.setInputBuffer(null);

var output = pr1.run();

console.log(output);
