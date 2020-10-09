"use strict";

var ohm = require("ohm-js");

var STR = require("./src/storage");
var Semantics = require("./src/semantics");
var GE = require("./src/gclasses");

//var IO = require("./src/io");

var GOhm = require("./src/grammar.js");


function parseGlossaJS(sourceCode, inputKeyboardBuffer) {


  var gram = ohm.grammar(new GOhm.GrammarOhm().getGrammar());
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


  return result.resolve(inputKeyboardBuffer);
}

module.exports = {
  parseGlossaJS: parseGlossaJS,
};
