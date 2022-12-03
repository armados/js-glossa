"use strict";

const ohm = require("ohm-js");

const Gram = require("./grammar.js");
const Semantics = require("./semantics");

const GE = require("./gclasses");
const STR = require("./storage");

const HP = require("./helper");
const GLBF = require("./globalfunctions");

const AST = require("./ast");
const AST2 = require("./ast2");

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

    var glbfunctions = new GLBF.GlobalFunctions();
    glbfunctions.applyAllFunctionsToScope(this.scope);

    this.app = {
      config: {},

      statistics: {},

      inputData: [],
      inputFunction: null,

      breakPoints: [],

      outputData: [],
      outputDataDetails: [],

      isStopRunning: () => {
        return this.stoprunning;
      },

      postMessage: async (msg, data1 = null, data2 = null) => {
        this.emit(msg, data1, data2);
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
        }

        if (this.app.breakPoints.includes(line) == true) {
          this.app.postMessage("reachbreakpoint", line);
          this.app["config"]["runstep"] = true;
          this.app["config"]["runstepflag"] = false;
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
        }

        await this.app.sleepFunc(30);
      },

      incrAssignCounter: () => {
        this.app["statistics"]["totalAssignCmd"] =
          this.app["statistics"]["totalAssignCmd"] + 1;

        if (
          this.app["statistics"]["totalAssignCmd"] >=
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
        this.app["statistics"]["totalLogicalComp"] =
          this.app["statistics"]["totalLogicalComp"] + 1;

        if (
          this.app["statistics"]["totalLogicalComp"] >=
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
    this.app["config"]["slowrunspeed"] = 200;
    this.app["config"]["runstep"] = false;
    this.app["config"]["runstepflag"] = false;

    this.app["statistics"]["totalAssignCmd"] = 0;
    this.app["statistics"]["totalLogicalComp"] = 0;
  }

  setReadInputFunction(func) {
    this.app["inputFunction"] = func;
  }

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

  // =====================================

  setStepRun(flag) {
    this.app["config"]["runstep"] = flag;
  }

  setSlowRun(flag) {
    this.app["config"]["slowrunflag"] = flag;
  }
  getSlowRun() {
    return this.app["config"]["slowrunflag"];
  }

  setDebugMode(flag) {
    this.app["config"]["debugmode"] = flag;
  }

  isrunning() {
    return this.running;
  }

  terminate() {
    this.stoprunning = true;
    this.runNextStatement();
  }

  runNextStatement() {
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

  runIsPaused() {
    return this.app["config"]["runstep"];
  }

  getOutput() {
    return this.app.getOutput().join("\n");
  }

  getOutputDetails() {
    return this.app.getOutputDetails().join("\n");
  }

  addBreakpoint(line) {
    this.app.breakPoints.push(line);
  }

  removeBreakpoint(line) {
    console.log("remove line breakpoint");
    var index = this.app.breakPoints.indexOf(line);
    if (index > -1) {
      console.log("line found in array and removed");
      this.app.breakPoints.splice(index, 1);
    }
  }

  async run() {
    this.app.postMessage("started");

    this.running = true;

    var gram = ohm.grammar(Gram.getGrammar());
    var sem = Semantics.load(gram);

    var match = gram.match(this.sourceCode);

    if (!match.succeeded()) throw new GE.GError(match.message);

    var result = sem(match).toAST();
    if (!result) throw new GE.GError(result);

    /*
    var myasttree = new AST.ASTree(result);
    var tree = myasttree.generate();

    console.log(tree);
*/
    /*
var myasttree = new AST2.ASTree(result);
var tree = myasttree.generate();

console.log(tree);
*/

    this.app.postMessage("continuerunning");

    // await new Promise(async (resolve, reject) => {
    try {
      await result.resolve(this.app, this.scope);
      console.log("App terminated. (normal)");
     // resolve("ok");
    } catch (e) {
      console.log("App terminated (abnormal)");
      if (e instanceof GE.GError) {
        this.app.postMessage("error", e.message);
       // reject("error");
      } else if (e instanceof GE.GInterrupt) {
        this.app.postMessage("stopped", e.message);
       // reject("stopped");
      } else {
        console.log("===> unknown error code");
        console.log(e);
       // reject("unknown-error");
      }
    }
    //  });

    /*
    const pro2 = new Promise(async (resolve, reject) => {
      while (!this.stoprunning) {
        await this.app.sleepFunc(50);
      }
      reject("user-interrupt");
    });
    */

    /*await Promise.race([pro1])
      .then((response) => {
        //console.log("App terminated. Good response: " + response);
      })
      .catch((err) => {
        //console.log("App terminated. Reject response: " + err);
      });
*/
    this.running = false;
    this.app.postMessage("finished");
  }
}

module.exports = {
  GlossaJS,
};
