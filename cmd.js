#!/usr/bin/env node


"use strict";

var fs = require("fs");
var path = require("path");
var ohm = require("ohm-js");

var MObjects = require("./objects");
var Semantics = require("./semantics");

var Storage = require("./storage");
var IO = require("./io");

var parseArgs = require('minimist');


var globalScope = new MObjects.Scope();

globalScope.addSymbol("Α_Μ",  new Storage.STRBuiltinFunction(function (A) {
  return new MObjects.MNumber(Math.trunc(A.val / 1));
}));

globalScope.addSymbol("Α_Τ",  new Storage.STRBuiltinFunction(function (A) {
  if (A.val < 0) return new MObjects.MNumber(-A.val);
  return A;
}));

globalScope.addSymbol("Τ_Ρ",  new Storage.STRBuiltinFunction(function (A) {
  if (A.val < 0) throw new Error("Σφάλμα. Δεν ορίζεται ρίζα αρνητικού αριθμού");
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
    throw new Error(match.message);
  }

  var result = sem(match).toAST();

  if (!result) {
    console.log("===> Error!");
    throw new Error("Error in toAST to give results");
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
  fs.readFileSync(path.join(__dirname, "grammar.ohm")).toString()
);
var sem = Semantics.load(gram);


const args = parseArgs(process.argv);
console.log(args);

var filename = process.argv[2];

var sourceCode = fs.readFileSync( filename ).toString();


var inputKeyboardBuffer = null;
var output = parse(sourceCode, inputKeyboardBuffer);
console.log(output);

