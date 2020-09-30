"use strict";

var GE = require("./gclasses");

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
    return this.data == 0 ? true : false;
  }

  getSingleInputData() {
    if (this.isEmpty()) throw new GE.GError("Σφάλμα. Τα δεδομένα εισόδου δεν επαρκούν για την εκτέλεση του προγράμματος.");

    return this.data.shift();
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
