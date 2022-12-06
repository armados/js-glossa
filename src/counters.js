"use strict";

const GE = require("./gclasses");

class Counters {

  constructor (config) {
    this.config = config;
    this.reset();
  }

  reset() {
    console.log('Resetting counters');
    this.totalAssignCmd = 0;
    this.totalLogicalComp = 0;
  }

  getTotalAssignCmd() {
    return this.totalAssignCmd;
  }

  getTotalLogicalComp() {
    return this.totalLogicalComp;
  }

  getStats() {
    //return this.app["statistics"];
    console.log('getTotalAssignCmd ' + this.getTotalAssignCmd());
    console.log('getTotalLogicalComp ' + this.getTotalLogicalComp());
  }

  incrAssignCounter() {
    this.totalAssignCmd += 1;

    if (this.getTotalAssignCmd() >= this.config["maxExecutionCmd"])
      throw new GE.GError(
        "Το πρόγραμμα έφτασε το μέγιστο επιτρεπτό όριο των " +
          this.config["maxExecutionCmd"] +
          " εντολών εκχώρησης.",
        this.cmdLineNo
      ); //FIXME:
  }

  incrLogicalCounter() {
    this.totalLogicalComp += 1;

    if (this.getTotalLogicalComp() >= this.config["maxLogicalComp"])
      throw new GE.GError(
        "Το πρόγραμμα έφτασε το μέγιστο επιτρεπτό όριο των " +
          this.config["maxLogicalComp"] +
          " συνθηκών.",
        this.cmdLineNo
      ); //FIXME:
  }
}

module.exports = {
  Counters,
};
