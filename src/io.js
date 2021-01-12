"use strict";

class InputBuffer {
  constructor() {
    this.inputData = [];
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
}

class OutputBuffer {
  constructor() {
    this.outputData = [];
    this.outputDataDetails = [];
  }
  async outputAdd(val) {
    this.outputData.push(val);
    this.app.postMessage("outputappend", val);
  }

  async outputAddDetails(val, line = null) {
    var val2 = (line != null ? "Γραμμή " + line + ". " : "") + val;
    this.outputDataDetails.push(val2);
    this.app.postMessage("outputdetailsappend", val2);
  }

  async getOutput() {
    return this.outputData.join("\n");
  }

  async getOutputDetails() {
    return this.outputDataDetails;
  }
}

module.exports = {
  InputBuffer,
  OutputBuffer,
};
