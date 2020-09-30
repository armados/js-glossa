"use strict";

var fs = require("fs");
var path = require("path");
var ohm = require("ohm-js");

var MObjects = require("./src/objects");
var Semantics = require("./src/semantics");
var GE = require("./src/gclasses");

//var ast = require("./src/ast");

var Storage = require("./src/storage");
var IO = require("./src/io");


var globalScope = new MObjects.Scope();

globalScope.addSymbol("Α_Μ",  new Storage.STRBuiltinFunction(function (A) {
  return new MObjects.MNumber(Math.trunc(A.val / 1));
}));

globalScope.addSymbol("Α_Τ",  new Storage.STRBuiltinFunction(function (A) {
  if (A.val < 0) return new MObjects.MNumber(-A.val);
  return A;
}));

globalScope.addSymbol("Τ_Ρ",  new Storage.STRBuiltinFunction(function (A) {
  if (A.val < 0) throw new GE.GError("Σφάλμα. Δεν ορίζεται ρίζα αρνητικού αριθμού");
  return new MObjects.MNumber( Math.sqrt(A.val) );
}));

globalScope.addSymbol("ΗΜ",  new Storage.STRBuiltinFunction(function (A) {
  return new MObjects.MNumber( Math.sin(A.val) );
}));

globalScope.addSymbol("ΣΥΝ",  new Storage.STRBuiltinFunction(function (A) {
  return new MObjects.MNumber( Math.cos(A.val) );
}));

globalScope.addSymbol("Ε",  new Storage.STRBuiltinFunction(function (A) {
  return new MObjects.MNumber( Math.exp(A.val) );
}));

globalScope.addSymbol("ΕΦ",  new Storage.STRBuiltinFunction(function (A) {
  return new MObjects.MNumber( Math.tan(A.val) );
}));

globalScope.addSymbol("ΛΟΓ",  new Storage.STRBuiltinFunction(function (A) {
  return new MObjects.MNumber( Math.log(A.val) );
}));




// ========================

function parse(input, inputKeyboardBuffer) {

  var match = gram.match(input);

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


  //var tree = new ast.ASTree(result);
  //var treeoutput = tree.generate();
  //console.log('=> ResultAST: ', treeoutput);

  return result.resolve(globalScope, IOKeyboard);
}



var gram = ohm.grammar(
  fs.readFileSync(path.join(__dirname, "src", "grammar", "grammar.ohm")).toString()
);
var sem = Semantics.load(gram);



var filename = "./samples/sample8.glo";
var sourceCode = fs.readFileSync(path.join(__dirname, filename)).toString();


console.log("==[ Program started ]=========");

var inputKeyboardBuffer = null;
var output = parse(sourceCode, inputKeyboardBuffer);
console.log(output);

//console.log("==[ Program terminated code ]=");
