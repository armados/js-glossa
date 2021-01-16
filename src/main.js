"use strict";

const ohm = require("ohm-js");

const Gram = require("./grammar.js");
const Semantics = require("./semantics");

const Atom = require("./atom");
const GE = require("./gclasses");
const STR = require("./storage");

const HP = require("./helper");

const EventEmitter = require("events");

class GlossaJS extends EventEmitter {
  constructor() {
    super();
    this.init();
  }

  init() {
    this.running = false;

    this.stoprunning = false;

    this.sourceCode = null;

    this.scope = new STR.SScope();

    this.initGlobalFunction(this.scope);

    this.app = {
      config: {},

      statistics: {},

      inputData: [],
      inputFunction: null,

      outputData: [],
      outputDataDetails: [],

      postMessage: async (msg, data = null) => {
        this.emit(msg, data);
      },

      outputAdd: async (val) => {
        this.app.outputData.push(val);
        this.app.postMessage("outputappend", val);
      },

      outputAddDetails: async (val, line = null) => {
        var val2 = (line != null ? "Γραμμή " + line + ". " : "") + val;
        this.app.outputDataDetails.push(val2);
        this.app.postMessage("outputdetailsappend", val2);
      },

      getOutput: () => {
        return this.app.outputData.join("\n");
      },

      getOutputDetails: () => {
        return this.app.outputDataDetails;
      },

      inputAddToBuffer: (val) => {
        this.app.inputData.push(val);
      },

      inputSetBuffer: (val) => {
        this.app.inputData = val;
      },

      inputIsEmptyBuffer: () => {
        return this.app.inputData.length == 0;
      },

      inputFetchValueFromBuffer: () => {
        if (this.app.inputIsEmptyBuffer()) return null;

        var value = this.app.inputData.shift();

        if (typeof value == "boolean") return value;

        if (HP.StringIsNumFloat(value)) {
          return Number(value);
        } else {
          return String(value.replace(/['"]+/g, ""));
        }
      },

      // ===========================

      sleepFunc: async (ms) => {
        let promise = new Promise((resolve, reject) => {
          setTimeout(() => resolve(), ms);
        });

        await promise;
      },

      setActiveLine: async (scope, line) => {
        scope.cmdLineNo = line;

        if (!this.app["config"]["debugmode"]) return;

        if (this.stoprunning == true) {
          throw new GE.GInterrupt(
            "Διακοπή της εκτέλεσης του προγράμματος από τον χρήστη.",
            line
          );
        }

        if (
          this.app["config"]["slowrunflag"] == true ||
          this.app["config"]["runstep"] == true
        ) {
          this.app.postMessage("line", line);
          this.app.postMessage("memory", scope.getMemory());
        }

        if (this.app["config"]["runstep"] == false) {
          if (this.app["config"]["slowrunflag"] == false) {
            await this.app.sleepFunc(this.app["config"]["runspeed"]);
          } else {
            await this.app.sleepFunc(this.app["config"]["slowrunspeed"]);
          }
        } else {
          this.app.postMessage("paused");
          while (
            this.app["config"]["runstepflag"] == false &&
            this.app["config"]["runstep"] == true
          ) {
            await this.app.sleepFunc(25);
          }
          this.app["config"]["runstepflag"] = false;
          this.app.postMessage("continuerunning");
        }
      },

      setActiveLineWithoutStep: async (scope, line) => {
        scope.cmdLineNo = line;

        if (!this.app["config"]["debugmode"]) return;

        if (this.stoprunning == true) {
          throw new GE.GInterrupt(
            "Διακοπή της εκτέλεσης του προγράμματος από τον χρήστη.",
            line
          );
        }

        if (
          this.app["config"]["slowrunflag"] == true ||
          this.app["config"]["runstep"] == true
        ) {
          this.app.postMessage("line", line);
          this.app.postMessage("memory", scope.getMemory());
        }

        await this.app.sleepFunc(40);
      },

      incrAssignCounter: () => {
        this.app.statistics["totalAssignCmd"] =
          this.app.statistics["totalAssignCmd"] + 1;

        if (
          this.app.statistics["totalAssignCmd"] >=
          this.app["config"]["maxExecutionCmd"]
        )
          throw new GE.GError(
            "Το πρόγραμμα έφτασε το μέγιστο επιτρεπτό όριο των " +
              this.app["config"]["maxExecutionCmd"] +
              " εντολών εκχώρησης.",
            this.cmdLineNo
          ); //FIXME:
      },

      incrLogicalCounter: () => {
        this.app.statistics["totalLogicalComp"] =
          this.app.statistics["totalLogicalComp"] + 1;

        if (
          this.app.statistics["totalLogicalComp"] >=
          this.app["config"]["maxLogicalComp"]
        )
          throw new GE.GError(
            "Το πρόγραμμα έφτασε το μέγιστο επιτρεπτό όριο των " +
              this.app["config"]["maxLogicalComp"] +
              " συνθηκών.",
            this.cmdLineNo
          ); //FIXME:
      },
    };

    this.app["config"]["maxExecutionCmd"] = 100000;
    this.app["config"]["maxLogicalComp"] = 100000;

    this.app["config"]["debugmode"] = false;
    this.app["config"]["slowrunflag"] = false;
    this.app["config"]["runspeed"] = 0;
    this.app["config"]["slowrunspeed"] = 250;
    this.app["config"]["runstep"] = false;
    this.app["config"]["runstepflag"] = false;

    this.app["statistics"]["totalAssignCmd"] = 0;
    this.app["statistics"]["totalLogicalComp"] = 0;
  }

  // ======================

  // =====================================

  setReadInputFunction(func) {
    this.app["inputFunction"] = func;
  }
  // ==============================

  getStats() {
    return this.app["statistics"];
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
      arrKeyboard.forEach((e) => this.app.inputAddToBuffer(e));
    }
  }

  // ===================================================
  initGlobalFunction(scope) {
    scope.addSymbol(
      "Α_Μ",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var app = arrArgs[1];
        var parentScope = arrArgs[2];

        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης.",
            parentScope.cmdLineNo
          );

        if (A == null)
          throw new GE.GError(
            "Το αναγνωριστικό " + A + " δεν έχει αρχικοποιηθεί.",
            parentScope.cmdLineNo
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση Α_Μ δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            parentScope.cmdLineNo
          );

        // Use Math.floor or Math.trunc
        return new Atom.MNumber(Math.floor(A.val));
      })
    );

    scope.addSymbol(
      "Α_Τ",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var app = arrArgs[1];
        var parentScope = arrArgs[2];

        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης.",
            parentScope.cmdLineNo
          );

        if (A == null)
          throw new GE.GError(
            "Το αναγνωριστικό " + A + " δεν έχει αρχικοποιηθεί.",
            parentScope.cmdLineNo
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση Α_Τ δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            parentScope.cmdLineNo
          );

        if (A.val < 0) return new Atom.MNumber(-A.val);
        return new Atom.MNumber(A.val);
      })
    );

    scope.addSymbol(
      "Τ_Ρ",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var app = arrArgs[1];
        var parentScope = arrArgs[2];

        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης.",
            parentScope.cmdLineNo
          );

        if (A == null)
          throw new GE.GError(
            "Το αναγνωριστικό " + A + " δεν έχει αρχικοποιηθεί.",
            parentScope.cmdLineNo
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση Τ_Ρ δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            parentScope.cmdLineNo
          );

        if (A.val < 0)
          throw new GE.GError(
            "Η συνάρτηση Τ_Ρ δεν μπορεί να λάβει αρνητική τιμή.",
            parentScope.cmdLineNo
          );

        return new Atom.MNumber(Math.sqrt(A.val));
      })
    );

    scope.addSymbol(
      "ΗΜ",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var app = arrArgs[1];
        var parentScope = arrArgs[2];

        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης.",
            parentScope.cmdLineNo
          );

        if (A == null)
          throw new GE.GError(
            "Το αναγνωριστικό " + A + " δεν έχει αρχικοποιηθεί.",
            parentScope.cmdLineNo
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση ΗΜ δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            parentScope.cmdLineNo
          );

        const degrees = (A.val * Math.PI) / 180;

        return new Atom.MNumber(Math.sin(degrees));
      })
    );

    scope.addSymbol(
      "ΣΥΝ",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var app = arrArgs[1];
        var parentScope = arrArgs[2];

        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης.",
            parentScope.cmdLineNo
          );

        if (A == null)
          throw new GE.GError(
            "Το αναγνωριστικό " + A + " δεν έχει αρχικοποιηθεί.",
            parentScope.cmdLineNo
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση ΣΥΝ δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            parentScope.cmdLineNo
          );

        const degrees = (A.val * Math.PI) / 180;

        return new Atom.MNumber(Math.cos(degrees));
      })
    );

    scope.addSymbol(
      "Ε",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var app = arrArgs[1];
        var parentScope = arrArgs[2];

        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης.",
            parentScope.cmdLineNo
          );

        if (A == null)
          throw new GE.GError(
            "Το αναγνωριστικό " + A + " δεν έχει αρχικοποιηθεί.",
            parentScope.cmdLineNo
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση Ε δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            parentScope.cmdLineNo
          );

        return new Atom.MNumber(Math.exp(A.val));
      })
    );

    scope.addSymbol(
      "ΕΦ",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var app = arrArgs[1];
        var parentScope = arrArgs[2];

        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης.",
            parentScope.cmdLineNo
          );

        if (A == null)
          throw new GE.GError(
            "Το αναγνωριστικό " + A + " δεν έχει αρχικοποιηθεί.",
            parentScope.cmdLineNo
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση ΕΦ δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            parentScope.cmdLineNo
          );

        const degrees = (A.val * Math.PI) / 180;

        return new Atom.MNumber(Math.tan(degrees));
      })
    );

    scope.addSymbol(
      "ΛΟΓ",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var app = arrArgs[1];
        var parentScope = arrArgs[2];

        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης.",
            parentScope.cmdLineNo
          );

        if (A == null)
          throw new GE.GError(
            "Το αναγνωριστικό " + A + " δεν έχει αρχικοποιηθεί.",
            parentScope.cmdLineNo
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση ΛΟΓ δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            parentScope.cmdLineNo
          );

        if (A.val <= 0)
          throw new GE.GError(
            "Η συνάρτηση ΛΟΓ δεν μπορεί να δεχτεί αρνητικές τιμές ή το μηδέν.",
            parentScope.cmdLineNo
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

  isrunning() {
    return this.running;
  }

  setStepRun(flag) {
    this.app["config"]["runstep"] = flag;
  }
  setSlowRun(flag) {
    this.app["config"]["slowrunflag"] = flag;
  }

  setDebugMode(flag) {
    this.app["config"]["debugmode"] = flag;
  }

  terminate() {
    this.stoprunning = true;
  }

  runNext() {
    this.app["config"]["runstep"] = true; // switch to step mode
    this.app["config"]["runstepflag"] = true;
  }

  runPause() {
    this.app["config"]["runstep"] = true;
    this.app["config"]["runstepflag"] = false;
  }

  runContinue() {
    this.app["config"]["runstep"] = false;
    this.app["config"]["runstepflag"] = true;
  }

  isPaused() {
    return this.app["config"]["runstep"];
  }

  async run() {
    this.app.postMessage("started");

    this.running = true;

    try {
      var gram = ohm.grammar(Gram.getGrammar());
      var sem = Semantics.load(gram);

      var match = gram.match(this.sourceCode);

      if (!match.succeeded()) throw new GE.GError(match.message);

      var result = sem(match).toAST();
      if (!result) throw new GE.GError(result);

      this.app.postMessage("continuerunning");
      await result.resolve(this.app, this.scope);
    } catch (e) {
      //console.log('GlossaJS: Main(): Error catch: ' + e);
      if (e instanceof GE.GError) {
        this.app.postMessage("error", e.message);
      } else if (e instanceof GE.GInterrupt) {
        this.app.postMessage("stopped", e.message);
      } else {
        console.log("=== unknown catch code");
        console.log(e);
      }
    } finally {
      this.running = false;
      this.app.postMessage("finished");
    }
  }

  getOutput() {
    return this.app.getOutput().join("\n");
  }
  getOutputDetails() {
    return this.app.getOutputDetails().join("\n");
  }
}

module.exports = {
  GlossaJS,
};
