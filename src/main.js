"use strict";

const ohm = require("ohm-js");

const GOhm = require("./grammar.js");
const Semantics = require("./semantics");

const Atom = require("./atom");
const GE = require("./gclasses");
const STR = require("./storage");

const HP = require("./helper");

const EventEmitter = require("events");

class GlossaJSStorage extends EventEmitter {
  constructor() {
    super();
  }
}

class GlossaJS extends EventEmitter {
  constructor() {
    super();

    this.init();
  }

  init() {
    this.running = false;
    this.stoprunning = false; // FIXME:

    this.sourceCode = null;

    this.scope = new STR.SScope();

    this.initGlobalFunction();

    this.app = {
      config: {},

      statistics: {},

      inputData: [],
      outputData: [],
      outputDataDetails: [],

      outputAdd: async (val) => {
        console.log(val);
        this.app.outputData.push(val);

        this.emit("outputappend", val);
      },

      outputAddDetails: async (val, line = null) => {
        var val2 = (line != null ? "Γραμμή " + line + ". " : "") + val;
        this.app.outputDataDetails.push(val2);

        this.emit("outputdetailsappend", val2);
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

        if (!isNaN(parseFloat(value))) return Number(value);
        else return String(value.replace(/['"]+/g, ""));
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

        if (
          this.app.config["slowrunflag"] == true ||
          this.app.config["runstep"] == true
        ) {
          this.emit("line", line);
          this.emit("memory", scope.localStorage);
        }

        if (this.app.config["runstep"] == false) {
          if (this.app.config["slowrunflag"] == false) {
            await this.app.sleepFunc(this.app.config["runspeed"]);
          } else {
            await this.app.sleepFunc(this.app.config["slowrunspeed"]);
          }
        } else {
          while (
            this.app.config["runstepflag"] == false &&
            this.app.config["runstep"] == true
          ) {
            await this.app.sleepFunc(15);
          }
          this.app.config["runstepflag"] = false;
        }

        if (this.stoprunning == true) {
          this.stoprunning = false;
          return Promise.reject(
            new Error(
              "[#] Έγινε διακοπή της εκτέλεσης του προγράμματος από τον χρήστη."
            )
          );
        }
      },

      setActiveLineWithoutStep: async (scope, line) => {
        scope.cmdLineNo = line;

        if (
          this.app.config["slowrunflag"] == true ||
          this.app.config["runstep"] == true
        ) {
          this.emit("line", line);
          this.emit("memory", scope.localStorage);
        }

        await this.app.sleepFunc(40);

        if (this.stoprunning == true) {
          this.stoprunning = false;
          return Promise.reject(
            new Error(
              "[#] Έγινε διακοπή της εκτέλεσης του προγράμματος από τον χρήστη."
            )
          );
        }
      },

      incrAssignCounter: () => {
        this.app.statistics["totalAssignCmd"] =
          this.app.statistics["totalAssignCmd"] + 1;

        if (
          this.app.statistics["totalAssignCmd"] >=
          this.app.config["maxExecutionCmd"]
        )
          throw new GE.GError(
            "Το πρόγραμμα έφτασε το μέγιστο επιτρεπτό όριο των " +
              this.app.config["maxExecutionCmd"] +
              " εντολών εκχώρησης.",
            this.cmdLineNo
          ); //FIXME:
      },

      incrLogicalCounter: () => {
        this.app.statistics["totalLogicalComp"] =
          this.app.statistics["totalLogicalComp"] + 1;

        if (
          this.app.statistics["totalLogicalComp"] >=
          this.app.config["maxLogicalComp"]
        )
          throw new GE.GError(
            "Το πρόγραμμα έφτασε το μέγιστο επιτρεπτό όριο των " +
              this.app.config["maxLogicalComp"] +
              " συνθηκών.",
            this.cmdLineNo
          ); //FIXME:
      },
    };

    this.app["config"]["maxExecutionCmd"] = 100000;
    this.app["config"]["maxLogicalComp"] = 100000;
    this.app["config"]["slowrunflag"] = false;
    this.app["config"]["runspeed"] = 0;
    this.app["config"]["slowrunspeed"] = 200;
    this.app["config"]["runstep"] = false;
    this.app["config"]["runstepflag"] = false;

    this.app["statistics"]["totalAssignCmd"] = 0;
    this.app["statistics"]["totalLogicalComp"] = 0;
  }

  // ======================

  // =====================================

  // ==============================

  getStats() {
    //return this.scope.statistics;
  }

  isrunning() {
    return this.running;
  }

  setStepRun(flag) {
    this.app.config["runstep"] = flag;
  }
  setSlowRun(flag) {
    this.app.config["slowrunflag"] = flag;
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
            "Η συνάρτηση Τ_Ρ δεν μπορεί να λάβει αρνητική τιμή.",
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

          const degrees = (A.val * Math.PI) / 180;

        return new Atom.MNumber(Math.sin(degrees));
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

          const degrees = (A.val * Math.PI) / 180;

        return new Atom.MNumber(Math.cos(degrees));
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

          const degrees = (A.val * Math.PI) / 180;

        return new Atom.MNumber(Math.tan(degrees));
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

          if (A.val <= 0)
          throw new GE.GError(
            "Η συνάρτηση ΛΟΓ δεν μπορεί να δεχτεί αρνητικές τιμές ή το μηδέν.",
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

    this.stoprunning = true;

    this.emit("stopped");
  }

  async runNext() {
    this.app.config["runstep"] = true; // switch to step mode
    this.app.config["runstepflag"] = true;
    this.emit("runnext");
  }

  async run() {
    this.emit("started");

    this.running = true;

    try {
      var gram = ohm.grammar(new GOhm.GrammarOhm().getGrammar());
      var sem = Semantics.load(gram);

      var match = gram.match(this.sourceCode);

      if (!match.succeeded()) throw new GE.GError(match.message);

      var result = sem(match).toAST();
      if (!result) throw new GE.GError(result);

      await result.resolve(this.app, this.scope);
    } catch (e) {
      console.log(e.message);
      //console.log(e);
      this.emit("error", e.message);
    } finally {
      this.running = false;
      this.emit("finished");
    }
  }

  getOutput() {
    return this.getOutput().join("\n");
  }
  getOutputDetails() {
    return this.getOutputDetails().join("\n");
  }
}

var gloObjectsID = [];
var gloObjectsAPP = [];

function newGlossaApp(id) {
  const index = gloObjectsID.indexOf(id);
  if (index >= 0) return false;

  var app = new GlossaJS();
  gloObjectsID.push(id);
  gloObjectsAPP.push(app);
  return app;
}

function getGlossaApp(id) {
  const index = gloObjectsID.indexOf(id);
  return index >= 0 ? gloObjectsAPP[index] : false;
}

module.exports = {
  GlossaJS,
  newGlossaApp,
  getGlossaApp,
};
