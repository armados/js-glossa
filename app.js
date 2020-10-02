"use strict";

var fs = require("fs");
var path = require("path");
var ohm = require("ohm-js");

var MObjects = require("./src/objects");
var Semantics = require("./src/semantics");
var GE = require("./src/gclasses");

var IO = require("./src/io");




// ========================

function parseGlossaJS(sourceCode, inputKeyboardBuffer) {

  var gram = ohm.grammar(
    fs.readFileSync(path.join(__dirname, "src", "grammar", "grammar.ohm")).toString()
  );
  var sem = Semantics.load(gram);
  
  var match = gram.match(sourceCode);

  if (!match.succeeded()) {
    console.log("===> Error");
    throw new GE.GError(match.message);
  }

  var result = sem(match).toAST();

  if (!result) {
    console.log("===> Error!");
    throw new GE.GError("Error in toAST to give results");
  }

  var IOKeyboard = new IO.InputDevice();

  if (inputKeyboardBuffer != null && inputKeyboardBuffer.length) {
    //console.log('>> Setting keyboard buffer from parameters');
    IOKeyboard.set(inputKeyboardBuffer);
  }


  var globalScope = new MObjects.Scope();

  return result.resolve(globalScope, IOKeyboard);
}


console.log('hello world!');