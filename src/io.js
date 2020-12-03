"use strict";

const GE = require("./gclasses");

class IOBuffer {
  constructor() {
      this.inputData  = [];
      this.outputData = [];
      this.outputDataDetails = [];
    }
  
    outputAdd(val) {
      this.outputData.push(val);
    }

    outputAddDetails(val, line=null) {
      this.outputDataDetails.push(  (line != null ? 'Γραμμή ' + line + '. ': '') + val);
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
      return this.inputData.length == 0 ? true : false;
    }
  
    inputFetchValueFromBuffer() {
      if (this.inputIsEmptyBuffer())
        return null;
  
      var value = this.inputData.shift();
  
      if (!isNaN(parseFloat(value)))
        return Number(value);
      else
        return String(value.replace(/['"]+/g, ''));
    }




}

module.exports = {
  IOBuffer: IOBuffer
};
