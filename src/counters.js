"use strict";

const GE = require("./gclasses");

class Counters {
  maxExecutionCmd = 100000;
  maxLogicalComp = 100000;

  constructor() {
    this.reset();
  }

  reset() {
    this.totalLogicalComp = 0;
    this.totalKeyboardInputValues = 0;

    this.totalStmt_Assignment = 0;

    this.totalStmt_Write = 0;
    this.totalStmt_Read = 0;

    this.totalStmt_If_Then = 0;
    this.totalStmt_If_Then_Else = 0;
    this.totalStmt_If_Then_ElseIf = 0;

    this.totalStmt_Case = 0;

    this.totalStmt_While = 0;
    this.totalStmt_Do_While = 0;
    this.totalStmt_For = 0;

    this.totalFunctionCall = 0;
    this.totalProcedureCall = 0;

    this.totalUserFunctionCall = 0;
    this.totalUserProcedureCall = 0;

  }

  getAllCountersArray() {
    return this; //FIXME
  }

  incrConditionTests() {
    this.totalLogicalComp += 1;

    if (this.totalLogicalComp >= this.maxLogicalComp)
      throw new GE.GError(
        "Το πρόγραμμα έφτασε το μέγιστο επιτρεπτό όριο των " +
          this.maxLogicalComp +
          " συνθηκών.",
        this.cmdLineNo
      ); //FIXME:
  }

  incrKeyboardValues() { this.totalKeyboardInputValues += 1; }

  incrStmt_Assignment() {
    this.totalStmt_Assignment += 1;

    if (this.totalStmt_Assignment >= this.maxExecutionCmd)
      throw new GE.GError(
        "Το πρόγραμμα έφτασε το μέγιστο επιτρεπτό όριο των " +
          this.maxExecutionCmd +
          " εντολών εκχώρησης.",
        this.cmdLineNo
      ); //FIXME:
  }

  incrStmt_Write() { this.totalStmt_Write += 1; }
  incrStmt_Read() { this.totalStmt_Read += 1; }

  incrStmt_If_Then() { this.totalStmt_If_Then += 1; }
  incrStmt_If_Then_Else() { this.totalStmt_If_Then_Else += 1; }
  incrStmt_If_Then_ElseIf() { this.totalStmt_If_Then_ElseIf += 1; }

  incrStmt_Case() { this.totalStmt_Case += 1; }
 
  incrStmt_While() { this.totalStmt_While += 1; }
  incrStmt_Do_While() { this.totalStmt_Do_While += 1; }
  incrStmt_For() { this.totalStmt_For += 1; }
  
  incrFunctionCall() { this.totalFunctionCall += 1; }
  incrProcedureCall() { this.totalProcedureCall += 1; }
  
  incrUserFunctionCall() { this.totalUserFunctionCall += 1; }
  incrUserProcedureCall() { this.totalUserProcedureCall += 1; }
}

module.exports = {
  Counters,
};
