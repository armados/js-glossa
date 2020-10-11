"use strict";

var ohm = require("ohm-js");

var GOhm = require("./src/grammar.js");
var Semantics = require("./src/semantics");

var GE = require("./src/gclasses");

//var IO = require("./src/io");

class GlossaJS {
  constructor() {
    this.sourceCode = null;
    this.inputBuffer = null;
  }

  setSourceCode(data)  { this.sourceCode = data; }
  getSourceCode()      { return this.sourceCode; }

  setInputBuffer(data) { this.inputBuffer = data; }
  getInputBuffer()     { return this.inputBuffer; }

  run() {

    var gram = ohm.grammar(new GOhm.GrammarOhm().getGrammar());
    var sem = Semantics.load(gram);
  
    var match = gram.match(this.sourceCode);
  
    if (!match.succeeded()) {
      console.log("===> Error");
      throw new GE.GError(match.message);
    }
  
    var result = sem(match).toAST();
  
    if (!result) {
      console.log("===> Error!");
      throw new GE.GError("Error in toAST to give results");
    }

    //var AST = require("./src/ast");
    //var astree = new AST.ASTree(result);
    //var outast = astree.generate();

    //console.log(outast);

    return result.resolve(this.inputBuffer);
  }

}


module.exports = {
  GlossaJS: GlossaJS
};
