"use strict";

const GE = require("./gclasses");

class IOBuffer {
  constructor() {
    this.inputData = [];
    this.outputData = [];
    this.outputDataDetails = [];
  }

  outputAdd(val) {
    console.log(val);
    this.outputData.push(val);

    if (typeof updateUI === "function") {
      updateUI("outputappend", val);
    }
  }

  outputAddDetails(val, line = null) {
    var str = (line != null ? "Γραμμή " + line + ". " : "") + val;
    this.outputDataDetails.push(str);

    if (typeof updateUI === "function") {
      updateUI("outputdetailtsappend", str);
    }
  }

  getOutput() {
    return this.outputData;
  }

  getOutputDetails() {
    return this.outputDataDetails;
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

    if (!isNaN(parseFloat(value))) return Number(value);
    else return String(value.replace(/['"]+/g, ""));
  }
}

module.exports = {
  IOBuffer,
};
