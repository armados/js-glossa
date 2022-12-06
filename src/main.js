"use strict";

const ohm = require("ohm-js");

const Gram = require("./grammar.js");
const Semantics = require("./semantics");

const GE = require("./gclasses");
const STR = require("./storage");

const GLBF = require("./globalfunctions");

const AST = require("./ast");
const AST2 = require("./ast2");

const RT = require("./runtimeenvironment");

const EventEmitter = require("events");

class GlossaJS extends EventEmitter {
  constructor() {
    super();
    this.init();
  }

  getRuntime() {
    return this.runtime;
  }

  postMessage(msg, data1 = null, data2 = null) {
    this.emit(msg, data1, data2);
  }

  setReadInputFunction(func) {
    this.getRuntime().setReadInputFunc(func);
  }

  getStats() {
    return this.getRuntime().getCounters();
  }

  setSourceCode(data) {
    this.sourceCode = data;
  }

  setInputBuffer(data) {
    if (data != null && data.trim() != "") {
      //console.log('Keyboard buffer argIOKeyboard: ', argIOKeyboard);
      var arrKeyboard = data.split(",").map((item) => item.trim());
      arrKeyboard.forEach((e) => this.getRuntime().inputAddToBuffer(e));
    }
  }

  init() {
    this.sourceCode = null;

    var scope = new STR.SScope();

    var glbfunctions = new GLBF.GlobalFunctions();
    glbfunctions.applyAllFunctionsToScope(scope);

    this.runtime = new RT.RuntimeEnvironment(this, scope);
  }
  
  // =====================================

  setStepRun(flag) {
    this.getRuntime().config["runstep"] = flag;
  }

  setSlowRun(flag) {
    this.getRuntime().config["slowrunflag"] = flag;
  }

  getSlowRun() {
    return this.getRuntime().config["slowrunflag"];
  }

  setDebugMode(flag) {
    this.getRuntime().config["debugmode"] = flag;
  }

  isrunning() {
    return this.running;
  }

  terminate() {
    this.getRuntime().enableTerminationFlag();
    this.runNextStatement();
  }

  runNextStatement() {
    this.getRuntime().config["runstep"] = true; // switch to step mode
    this.getRuntime().config["runstepflag"] = true;
  }

  runPause() {
    this.getRuntime().config["runstep"] = true;
    this.getRuntime().config["runstepflag"] = false;
  }

  runContinue() {
    this.getRuntime().config["runstep"] = false;
    this.getRuntime().config["runstepflag"] = true;
  }

  runIsPaused() {
    return this.getRuntime().config["runstep"];
  }

  getOutput() {
    return this.getRuntime().getOutput().join("\n");
  }

  getOutputDetails() {
    return this.getRuntime().getOutputDetails().join("\n");
  }

  addBreakpoint(line) {
    this.getRuntime().breakPoints.push(line);
  }

  removeBreakpoint(line) {
    console.log("remove line breakpoint");
    var index = this.getRuntime().breakPoints.indexOf(line);
    if (index > -1) {
      console.log("line found in array and removed");
      this.getRuntime().breakPoints.splice(index, 1);
    }
  }

  async run() {
    this.postMessage("started");

    // this.running = true;

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

    // await new Promise(async (resolve, reject) => {
    try {
      var gram = ohm.grammar(Gram.getGrammar());
      var sem = Semantics.load(gram);

      var match = gram.match(this.sourceCode);

      if (!match.succeeded()) throw new GE.GErrorBeforeExec(match.message);

      var result = sem(match).toAST();
      if (!result) throw new GE.GErrorBeforeExec(result);

      // ready to run
      this.running = true;
      this.postMessage("continuerunning");

      await result.resolve(this.runtime);

      console.log("App terminated. (normal)");
    } catch (e) {
      console.log("App terminated (abnormal)");
      if (e instanceof GE.GErrorBeforeExec) {
        this.postMessage("error", e.message);
      } else if (e instanceof GE.GError) {
        this.postMessage("error", e.message);
      } else if (e instanceof GE.GInterrupt) {
        this.postMessage("stopped", e.message);
      } else {
        console.log("===> unknown error code");
        console.log(e);
      }
    }

    this.running = false;
    this.postMessage("finished");
  }
}

module.exports = {
  GlossaJS,
};
