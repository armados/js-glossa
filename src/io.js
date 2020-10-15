"use strict";

var GE = require("./gclasses");
var Storage = require("./storage");

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
    if (this.isEmpty()) throw new GE.GError("Τα δεδομένα εισόδου δεν επαρκούν για την εκτέλεση του προγράμματος.");

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

module.exports = {
  InputDevice: InputDevice,
  OutputDevice: OutputDevice,
};
