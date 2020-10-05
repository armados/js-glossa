"use strict";

function parseGlossaJS(sourceCode, inputKeyboardBuffer) {
  var ohm = require("ohm-js");

  var MObjects = require("./src/objects");
  var Semantics = require("./src/semantics");
  var GE = require("./src/gclasses");

  var IO = require("./src/io");

  var GOhm = require("./src/grammar.js");

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

  var globalScope = new MObjects.Scope();

  return result.resolve(globalScope, inputKeyboardBuffer);
}

module.exports = {
  parseGlossaJS: parseGlossaJS,
};
