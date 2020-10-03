#!/usr/bin/env node

"use strict";

var GlossaJS   = require("../app");

var fs = require("fs");
var minimist = require('minimist');

//FIXME: 
var args = minimist(process.argv.slice(2), {
  string: ['input'],           // --lang xml
  boolean: ['version'],     // --version
  alias: { v: 'version', i: 'input' },
  default: {  },
  stopEarly: true, /* populate _ with first non-option */
  unknown: function () { throw new GE.GError('Invalid arguments'); }
});

if (!(args['input']))
  throw new GE.GError('Missing input file');

var filename = args['input'];
var sourceCode = fs.readFileSync( filename ).toString();

var inputKeyboardBuffer = null;
var output = GlossaJS.parseGlossaJS(sourceCode, inputKeyboardBuffer);

console.log(output);
