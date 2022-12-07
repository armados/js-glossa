"use strict";

const GE = require("./gclasses");

class Counters {
  
  maxExecutionCmd = 100000;
  maxLogicalComp = 100000;


  constructor () {
    //this.config = config;
    this.reset();
  }

  reset() {
     this.totalAssignCmd = 0;
    this.totalLogicalComp = 0;
    this.totalKeyboardInputData = 0;
  }

  getTotalAssignCmd() {
    return this.totalAssignCmd;
  }

  getTotalLogicalComp() {
    return this.totalLogicalComp;
  }

  getAllCountersArray() {
    //return this.app["statistics"];
    //console.log('getTotalAssignCmd ' + this.getTotalAssignCmd());
    //console.log('getTotalLogicalComp ' + this.getTotalLogicalComp());

    return this; //FIXME
  }

  incrAssignCounter() {
    this.totalAssignCmd += 1;

    if (this.getTotalAssignCmd() >= this.maxExecutionCmd)
      throw new GE.GError(
        "Το πρόγραμμα έφτασε το μέγιστο επιτρεπτό όριο των " +
          this.maxExecutionCmd +
          " εντολών εκχώρησης.",
        this.cmdLineNo
      ); //FIXME:
    
  }

  incrLogicalCounter() {
    this.totalLogicalComp += 1;

    if (this.getTotalLogicalComp() >= this.maxLogicalComp)
      throw new GE.GError(
        "Το πρόγραμμα έφτασε το μέγιστο επιτρεπτό όριο των " +
          this.maxLogicalComp +
          " συνθηκών.",
        this.cmdLineNo
      ); //FIXME:
      
  }

  incrKeyboardInputCounter() {
    this.totalKeyboardInputData += 1;
  }


  
}

module.exports = {
  Counters,
};
