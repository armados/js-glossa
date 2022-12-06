"use strict";

const HP = require("./helper");
const GE = require("./gclasses");
const CT = require("./counters");

class RuntimeEnvironment {
  config = {};
  statistics = {};

  scopes = [];

  inputData = [];
  inputFunction = null;
  breakPoints = [];
  outputData = [];
  outputDataDetails = [];

  counters = new CT.Counters();

  stoprunning = false;

  constructor(parent, scope) {
    this._parent = parent;
    this.pushScope(scope);

    console.log("constructor runtitme environment");

    this.config["maxExecutionCmd"] = 100000;
    this.config["maxLogicalComp"] = 100000;

    this.config["debugmode"] = false;
    this.config["slowrunflag"] = false;
    this.config["runspeed"] = 0;
    this.config["slowrunspeed"] = 200;
    this.config["runstep"] = false;
    this.config["runstepflag"] = false;

    this.statistics["totalAssignCmd"] = 0;
    this.statistics["totalLogicalComp"] = 0;
  }

  reset() {}

  pushScope(element) {
    return this.scopes.push(element);
  }

  popScope() {
    if (this.scopes.length > 0) {
      return this.scopes.pop();
    }
  }

  getScope() {
    return this.scopes[this.scopes.length - 1];
  }

  postMessage(msg, data1 = null, data2 = null) {
    this._parent.postMessage(msg, data1, data2);
  }

  enableTerminationFlag() {
    this.stoprunning = true;
  }

  isTerminationFlag() {
    return this.stoprunning;
  }

  setReadInputFunc(func) {
    this.inputFunction = func;
  }

  inputAddToBuffer(val) {
    this.inputData.push(val);
  }

  inputSetBuffer(val) {
    this.inputData = val;
  }

  inputIsEmptyBuffer() {
    return this.inputData.length == 0;
  }

  inputFetchValueFromBuffer() {
    if (this.inputIsEmptyBuffer()) return null;

    var value = this.inputData.shift();

    if (typeof value == "boolean") return value;

    if (HP.StringIsNumFloat(value)) {
      return Number(value);
    } else {
      return String(value.replace(/['"]+/g, ""));
    }
  }

  async outputAdd(val) {
    this.outputData.push(val);
    this.postMessage("outputappend", val);
  }

  async outputAddDetails(val, line = null) {
    var val2 = (line != null ? "Γραμμή " + line + ". " : "") + val;
    this.outputDataDetails.push(val2);
    this.postMessage("outputdetailsappend", val2);
  }

  getOutput() {
    return this.outputData.join("\n");
  }

  getOutputDetails() {
    return this.outputDataDetails;
  }

  getCounters() {
    return this.counters;
  }

  async sleepFunc(ms) {
    let promise = new Promise((resolve, reject) => {
      setTimeout(() => resolve(), ms);
    });

    await promise;
  }

  async setActiveLine(scope, line) {
    scope.cmdLineNo = line;

    if (!this.config["debugmode"]) return;

    if (this.stoprunning == true) {
      throw new GE.GInterrupt(
        "Διακοπή της εκτέλεσης του προγράμματος από τον χρήστη.",
        line
      );
    }

    if (this.config["slowrunflag"] == true || this.config["runstep"] == true) {
      this.postMessage("line", line);
    }

    if (this.breakPoints.includes(line) == true) {
      this.postMessage("reachbreakpoint", line);
      this.config["runstep"] = true;
      this.config["runstepflag"] = false;
    }

    if (this.config["runstep"] == false) {
      if (this.config["slowrunflag"] == false) {
        await this.sleepFunc(this.config["runspeed"]);
      } else {
        await this.sleepFunc(this.config["slowrunspeed"]);
      }
    } else {
      this.postMessage("paused");
      while (
        this.config["runstepflag"] == false &&
        this.config["runstep"] == true
      ) {
        await this.sleepFunc(25);
      }
      this.config["runstepflag"] = false;
      this.postMessage("continuerunning");
    }
  }

  async setActiveLineWithoutStep(scope, line) {
    scope.cmdLineNo = line;

    if (!this.config["debugmode"]) return;

    if (this.stoprunning == true) {
      throw new GE.GInterrupt(
        "Διακοπή της εκτέλεσης του προγράμματος από τον χρήστη.",
        line
      );
    }

    if (this.config["slowrunflag"] == true || this.config["runstep"] == true) {
      this.postMessage("line", line);
    }

    await this.sleepFunc(30);
  }

  incrAssignCounter() {
    this.statistics["totalAssignCmd"] = this.statistics["totalAssignCmd"] + 1;

    if (this.statistics["totalAssignCmd"] >= this.config["maxExecutionCmd"])
      throw new GE.GError(
        "Το πρόγραμμα έφτασε το μέγιστο επιτρεπτό όριο των " +
          this.app["config"]["maxExecutionCmd"] +
          " εντολών εκχώρησης.",
        this.cmdLineNo
      ); //FIXME:
  }

  incrLogicalCounter() {
    this.statistics["totalLogicalComp"] =
      this.statistics["totalLogicalComp"] + 1;

    if (this.statistics["totalLogicalComp"] >= this.config["maxLogicalComp"])
      throw new GE.GError(
        "Το πρόγραμμα έφτασε το μέγιστο επιτρεπτό όριο των " +
          this.app["config"]["maxLogicalComp"] +
          " συνθηκών.",
        this.cmdLineNo
      ); //FIXME:
  }
}

module.exports = {
  RuntimeEnvironment,
};
