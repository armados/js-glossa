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

  getEnv() {
    return this.runtime;
  }

  postMessage(msg, data1 = null, data2 = null) {
    this.emit(msg, data1, data2);
  }

  setReadInputFunction(func) {
    this.getEnv().setReadInputFunc(func);
  }

  getCounters() {
    return this.getEnv().getCounters();
  }

  setSourceCode(data) {
    this.sourceCode = data;
  }

  setInputBuffer(values) {
    if (values == null || values.trim() == "") return;

    var arr = values.split(",").map((item) => item.trim());
    arr.forEach((e) => this.getEnv().inputAddToBuffer(e));
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
    this.getEnv().config["runstep"] = flag;
  }

  setSlowRun(flag) {
    this.getEnv().config["slowrunflag"] = flag;
  }

  getSlowRun() {
    return this.getEnv().config["slowrunflag"];
  }

  setDebugMode(flag) {
    this.getEnv().config["debugmode"] = flag;
  }

  isrunning() {
    return this.running;
  }

  terminate() {
    this.getEnv().enableTerminationFlag();
    this.runNextStatement();
  }

  runNextStatement() {
    this.getEnv().config["runstep"] = true; // switch to step mode
    this.getEnv().config["runstepflag"] = true;
  }

  runPause() {
    this.getEnv().config["runstep"] = true;
    this.getEnv().config["runstepflag"] = false;
  }

  runContinue() {
    this.getEnv().config["runstep"] = false;
    this.getEnv().config["runstepflag"] = true;
  }

  runIsPaused() {
    return this.getEnv().config["runstep"];
  }

  getOutput() {
    return this.getEnv().getOutput().join("\n");
  }

  getOutputDetails() {
    return this.getEnv().getOutputDetails().join("\n");
  }

  addBreakpoint(line) {
    this.getEnv().breakPoints.push(line);
  }

  removeBreakpoint(line) {
    console.log("remove line breakpoint");
    var index = this.getEnv().breakPoints.indexOf(line);
    if (index > -1) {
      this.getEnv().breakPoints.splice(index, 1);
    }
  }

  async run() {
    this.postMessage("started");

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

      if (!match.succeeded()) throw new GE.GSyntaxError(match.message);

      var result = sem(match).toAST();
      if (!result) throw new GE.GSyntaxError(result);

      /*       // test ast
    var myasttree = new AST.ASTree(result);
    var tree = myasttree.generate();
    console.log(tree); */

      // ready to run
      this.running = true;
      this.postMessage("continuerunning");

      await result.resolve(this.runtime);

      //console.log("App terminated. (normal)");
    } catch (e) {
      //console.log("App terminated (abnormal)");
      if (e instanceof GE.GSyntaxError) {
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
  GlossaJS
};
