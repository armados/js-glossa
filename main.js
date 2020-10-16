"use strict";

var ohm = require("ohm-js");

var GOhm = require("./src/grammar.js");
var Semantics = require("./src/semantics");

var Atom = require("./src/atom");
var GE = require("./src/gclasses");
var STR = require("./src/storage");

var IO = require("./src/io");

class GlossaJS {
  constructor() {
    this.sourceCode = null;

    this.io    = new IO.IOBuffer();

    this.scope = new STR.SScope();    
    this.scope.io = this.io;

    this.initGlobalFunction();
  }

  setSourceCode(data)  { this.sourceCode = data; }
  getSourceCode()      { return this.sourceCode; }

  setInputBuffer(data) {
    if (data != null && data != '') {
      //console.log('Keyboard buffer argIOKeyboard: ', argIOKeyboard);
      var arrKeyboard = data.split(',').map(item => item.trim());
      arrKeyboard.forEach( (e) => this.scope.io.inputAddToBuffer(e) );
    }
  }



  initGlobalFunction() {
    this.scope.addSymbol("Α_Μ",  new STR.STRBuiltinFunction(function (arrArgs) {
      var A = arrArgs[0];
      return new Atom.MNumber(Math.trunc(A.val /1));
    }));
    
    this.scope.addSymbol("Α_Τ",  new STR.STRBuiltinFunction(function (arrArgs) {
      var A = arrArgs[0];
      if (A.val < 0) return new Atom.MNumber(-A.val);
      return A;
    }));
    
    this.scope.addSymbol("Τ_Ρ",  new STR.STRBuiltinFunction(function (arrArgs) {
      var A = arrArgs[0];
      if (A.val < 0) throw new GE.GError('Δεν ορίζεται ρίζα αρνητικού αριθμού.');
      return new Atom.MNumber( Math.sqrt(A.val) );
    }));
    
    this.scope.addSymbol("ΗΜ",  new STR.STRBuiltinFunction(function (arrArgs) {
      var A = arrArgs[0];
      return new Atom.MNumber( Math.sin(A.val) );
    }));
    
    this.scope.addSymbol("ΣΥΝ",  new STR.STRBuiltinFunction(function (arrArgs) {
      var A = arrArgs[0];
      return new Atom.MNumber( Math.cos(A.val) );
    }));
    
    this.scope.addSymbol("Ε",  new STR.STRBuiltinFunction(function (arrArgs) {
      var A = arrArgs[0];
      return new Atom.MNumber( Math.exp(A.val) );
    }));
    
    this.scope.addSymbol("ΕΦ",  new STR.STRBuiltinFunction(function (arrArgs) {
      var A = arrArgs[0];
      return new Atom.MNumber( Math.tan(A.val) );
    }));
    
    this.scope.addSymbol("ΛΟΓ",  new STR.STRBuiltinFunction(function (arrArgs) {
      var A = arrArgs[0];
      return new Atom.MNumber( Math.log(A.val) );
    }));
  }

  removeGlobalFunction(name) {
    if (!this.scope.globalStorage.hasOwnProperty(name))
      throw new GE.GError('Critical: removeGlobalFunction(): Global function not exist ' + name);

    delete this.scope.globalStorage[name];
  }

  run() {

    var gram = ohm.grammar(new GOhm.GrammarOhm().getGrammar());
    var sem = Semantics.load(gram);
  
    var match = gram.match(this.sourceCode);
  
    if (!match.succeeded()) {
      this.io.outputAdd(match.message);
      this.io.outputAddDetails(match.message);
       return false;
    }
  
    var result = sem(match).toAST();
  
    if (!result) {
      this.io.outputAdd('Error in toAST to give results' + result);
      this.io.outputAddDetails('Error in toAST to give results' + result);
       return false;
    }

    //var AST = require("./src/ast");
    //var astree = new AST.ASTree(result);
    //var outast = astree.generate();
    //console.log(outast);


    try {
      result.resolve(this.scope)
    } catch (e) {
      //console.log('ErrorMsg: ', e.message);
      //console.log(e);
      this.io.outputAdd(e.message);
      this.io.outputAddDetails(e.message);
    }

    //console.log('IO: ', this.io);

    //return this.io.getOutput().join('\n');
    return true;
  }


  getOutput()        { return this.io.getOutput().join('\n') }
  getOutputDetails() { return this.io.getOutputDetails().join('\n') }
}

module.exports = {
  GlossaJS: GlossaJS
};
