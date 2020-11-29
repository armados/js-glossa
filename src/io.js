"use strict";

const GE = require("./gclasses");

class InputDevice {
  constructor() {
    this.data = [];
  }

  add(val) {
    this.data.push(val);
  }

  set(val) {
    this.data = val;
  }

  isEmpty() {
    return this.data.length == 0 ? true : false;
  }

  getSingleInputData() {
    if (this.isEmpty()) throw new GE.GError('Τα δεδομένα εισόδου δεν επαρκούν για την εκτέλεση του προγράμματος.');

    var value = this.data.shift();

    if (!isNaN(parseFloat(value)))
      return Number(value);
    else
      return String(value.replace(/['"]+/g, ''));

  }
}

class OutputDevice {
    constructor() {
        this.data = [];
      }
    
      add(val) {
        this.data.push(val);
      }
    
      get() {
        return this.data;
      }
}



class IOBuffer {
  constructor() {
      this.inputData  = [];
      this.outputData = [];
      this.outputDataDetails = [];
    }
  
    outputAdd(val) {
      this.outputData.push(val);
    }

    outputAddDetails(val) {
      this.outputDataDetails.push(val);
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
        throw new GE.GError('Τα δεδομένα εισόδου δεν επαρκούν για την εκτέλεση του προγράμματος.');
  
      var value = this.inputData.shift();
  
      if (!isNaN(parseFloat(value)))
        return Number(value);
      else
        return String(value.replace(/['"]+/g, ''));
    }




}

module.exports = {
  IOBuffer: IOBuffer,
  InputDevice: InputDevice,
  OutputDevice: OutputDevice,
};
