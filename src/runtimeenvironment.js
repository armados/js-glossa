"use strict";

const HP = require("./helper");
const GE = require("./gclasses");
const CT = require("./counters");

class RuntimeEnvironment {
  config = {};

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

    this.config["debugmode"] = false;
    this.config["slowrunflag"] = false;
    this.config["runspeed"] = 0;
    this.config["slowrunspeed"] = 200;
    this.config["runstep"] = false;
    this.config["runstepflag"] = false;
  }

  reset() {}

  pushScope(element) {
    this.scopes.push(element);
  }

  popScope() {
    if (this.scopes.length > 0) {
      this.scopes.pop();
    }
  }

  getScope() {
   // for (var i = this.scopes.length-1; i >= 0; i--)
   //   console.log('STOIVA:  ' + (i+1) + " " + this.scopes[i].title);
    
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


  async setActiveLine(line) {
    this.getScope().cmdLineNo = line;

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
        await HP.sleepFunc(this.config["runspeed"]);
      } else {
        await HP.sleepFunc(this.config["slowrunspeed"]);
      }
    } else {
      this.postMessage("paused");
      while (
        this.config["runstepflag"] == false &&
        this.config["runstep"] == true
      ) {
        await HP.sleepFunc(25);
      }
      this.config["runstepflag"] = false;
      this.postMessage("continuerunning");
    }
  }

  async setActiveLineWithoutStep(line) {
    this.getScope().cmdLineNo = line;

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

    await HP.sleepFunc(30);
  }

}

module.exports = {
  RuntimeEnvironment,
};
