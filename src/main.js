"use strict";

const ohm = require("ohm-js");

const GOhm = require("./grammar.js");
const Semantics = require("./semantics");

const Atom = require("./atom");
const GE = require("./gclasses");
const STR = require("./storage");

const IO = require("./io");
const HP = require("./helper");

class GlossaJS {
  constructor() {
    this.running = false;
    this.stoprunning = false;

    this.sourceCode = null;

    this.io = new IO.IOBuffer();

    this.scope = new STR.SScope();
    this.scope.io = this.io;
    this.scope.config["maxExecutionCmd"] = 100000;
    this.scope.config["maxLogicalComp"] = 100000;
    this.scope.config["runspeed"] = 0;

    this.initGlobalFunction();
  }

  getStats() {
    return this.scope.statistics;
  }

  isrunning() {
    return this.running;
  }

  setSourceCode(data) {
    this.sourceCode = data;
  }
  getSourceCode() {
    return this.sourceCode;
  }

  setInputBuffer(data) {
    if (data != null && data.trim() != "") {
      //console.log('Keyboard buffer argIOKeyboard: ', argIOKeyboard);
      var arrKeyboard = data.split(",").map((item) => item.trim());
      arrKeyboard.forEach((e) => this.scope.io.inputAddToBuffer(e));
    }
  }

  setSlowRun(flag) {
    this.scope.config["runspeed"] = (flag) ? 430 : 0;
  }

  initGlobalFunction() {
    this.scope.addSymbol(
      "Α_Μ",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var cmdLineNo = arrArgs[2];
        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης.",
            cmdLineNo
          );

        if (A == null)
          throw new GE.GError(
            "Το αναγνωριστικό " + A + " δεν έχει αρχικοποιηθεί.",
            cmdLineNo
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση Α_Μ δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            cmdLineNo
          );

        return new Atom.MNumber(Math.trunc(A.val / 1));
      })
    );

    this.scope.addSymbol(
      "Α_Τ",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var cmdLineNo = arrArgs[2];
        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης.",
            cmdLineNo
          );

        if (A == null)
          throw new GE.GError(
            "Το αναγνωριστικό " + A + " δεν έχει αρχικοποιηθεί.",
            cmdLineNo
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση Α_Τ δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            cmdLineNo
          );

        if (A.val < 0) return new Atom.MNumber(-A.val);
        return new Atom.MNumber(A.val);
      })
    );

    this.scope.addSymbol(
      "Τ_Ρ",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var cmdLineNo = arrArgs[2];
        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης.",
            cmdLineNo
          );

        if (A == null)
          throw new GE.GError(
            "Το αναγνωριστικό " + A + " δεν έχει αρχικοποιηθεί.",
            cmdLineNo
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση Τ_Ρ δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            cmdLineNo
          );

        if (A.val < 0)
          throw new GE.GError(
            "Δεν ορίζεται ρίζα αρνητικού αριθμού.",
            cmdLineNo
          );
        return new Atom.MNumber(Math.sqrt(A.val));
      })
    );

    this.scope.addSymbol(
      "ΗΜ",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var cmdLineNo = arrArgs[2];
        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης.",
            cmdLineNo
          );

        if (A == null)
          throw new GE.GError(
            "Το αναγνωριστικό " + A + " δεν έχει αρχικοποιηθεί.",
            cmdLineNo
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση ΗΜ δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            cmdLineNo
          );

        return new Atom.MNumber(Math.sin(A.val));
      })
    );

    this.scope.addSymbol(
      "ΣΥΝ",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var cmdLineNo = arrArgs[2];
        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης.",
            cmdLineNo
          );

        if (A == null)
          throw new GE.GError(
            "Το αναγνωριστικό " + A + " δεν έχει αρχικοποιηθεί.",
            cmdLineNo
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση ΣΥΝ δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            cmdLineNo
          );

        return new Atom.MNumber(Math.cos(A.val));
      })
    );

    this.scope.addSymbol(
      "Ε",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var cmdLineNo = arrArgs[2];
        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης.",
            cmdLineNo
          );

        if (A == null)
          throw new GE.GError(
            "Το αναγνωριστικό " + A + " δεν έχει αρχικοποιηθεί.",
            cmdLineNo
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση Ε δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            cmdLineNo
          );

        return new Atom.MNumber(Math.exp(A.val));
      })
    );

    this.scope.addSymbol(
      "ΕΦ",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var cmdLineNo = arrArgs[2];
        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης.",
            cmdLineNo
          );

        if (A == null)
          throw new GE.GError(
            "Το αναγνωριστικό " + A + " δεν έχει αρχικοποιηθεί.",
            cmdLineNo
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση ΕΦ δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            cmdLineNo
          );

        return new Atom.MNumber(Math.tan(A.val));
      })
    );

    this.scope.addSymbol(
      "ΛΟΓ",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var cmdLineNo = arrArgs[2];
        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης.",
            cmdLineNo
          );

        if (A == null)
          throw new GE.GError(
            "Το αναγνωριστικό " + A + " δεν έχει αρχικοποιηθεί.",
            cmdLineNo
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση ΛΟΓ δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            cmdLineNo
          );

        return new Atom.MNumber(Math.log(A.val));
      })
    );
  }

  removeGlobalFunction(name) {
    if (!this.scope.globalStorage.hasOwnProperty(name))
      throw new GE.GError(
        "Critical: removeGlobalFunction(): Global function not exist " + name
      );

    delete this.scope.globalStorage[name];
  }

  async terminate() {
    this.running = false;

    this.scope.stoprunning = true;

    console.log('user stopped programm execution');
  }

async runNext() {
  this.scope.config["runstep"] = true;
  this.scope.config["runstepflag"] = true;
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
      this.io.outputAdd("Error in toAST to give results" + result);
      this.io.outputAddDetails("Error in toAST to give results" + result);
      this.running = false;
      return false;
    }

    if (false) {
      var AST = require("./ast");
      var astree = new AST.ASTree(result);
      var outast = astree.generate();
      console.log(outast);
    }

    try {

      await result.resolve(this.scope);

    } catch (e) {
      console.log("Console ErrorMsg: ", e.message);
      console.log(e);
      this.io.outputAdd(e.message);
      this.io.outputAddDetails(e.message);
    } finally {
      this.running = false;
    }

    //console.log('IO: ', this.io);

    //return this.io.getOutput().join('\n');
    return true;
  }

  getOutput() {
    return this.io.getOutput().join("\n");
  }
  getOutputDetails() {
    return this.io.getOutputDetails().join("\n");
  }
}

module.exports = {
  GlossaJS,
};
