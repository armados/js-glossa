"use strict";

const ohm = require("ohm-js");

const GOhm = require("./src/grammar.js");
const Semantics = require("./src/semantics");

const Atom = require("./src/atom");
const GE = require("./src/gclasses");
const STR = require("./src/storage");

const IO = require("./src/io");

class GlossaJS {
  constructor() {
    this.running = true;
    this.sourceCode = null;

    this.io    = new IO.IOBuffer();

    this.scope = new STR.SScope();    
    this.scope.io = this.io;
    this.scope.config['maxExecutionCmd'] = 100000;
    this.scope.config['maxLogicalComp']  = 100000;

    this.initGlobalFunction();

  }

  getStats() { return this.scope.statistics; }

  isrunning() { return this.running; }


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

  async run() {

    this.running = true;

    var gram = ohm.grammar(new GOhm.GrammarOhm().getGrammar());
    var sem = Semantics.load(gram);
  
    var match = gram.match(this.sourceCode);
  
    if (!match.succeeded()) {
      this.io.outputAdd(match.message);
      this.io.outputAddDetails(match.message);
      this.running = false;
       return false;
    }
  
    var result = sem(match).toAST();
  
    if (!result) {
      this.io.outputAdd('Error in toAST to give results' + result);
      this.io.outputAddDetails('Error in toAST to give results' + result);
      this.running = false;
      return false;
    }

    //var AST = require("./src/ast");
    //var astree = new AST.ASTree(result);
    //var outast = astree.generate();
    //console.log(outast);


    try {
      result.resolve(this.scope);
    } catch (e) {
      console.log('Console ErrorMsg: ', e.message);
      //console.log(e);
      this.io.outputAdd(e.message);
      this.io.outputAddDetails(e.message);
    } finally {
      this.running = false;
    }
    this.running = false;

    //console.log('IO: ', this.io);

    //return this.io.getOutput().join('\n');
    return true;
  }


  getOutput()        { return this.io.getOutput().join('\n') }
  getOutputDetails() { return this.io.getOutputDetails().join('\n') }
}

module.exports = {
  GlossaJS
};
