"use strict";

class Statistics {
  constructor() {
    this.statistics = [];
    this.statistics["totalAssignCmd"] = 0;
    this.statistics["totalLogicalComp"] = 0;
  }

  getStats() {
    return this.app["statistics"];
  }

  incrAssignCounter() {
    this.statistics["totalAssignCmd"] += 1;

    if (this.statistics["totalAssignCmd"] >= this.app.config["maxExecutionCmd"])
      throw new GE.GError(
        "Το πρόγραμμα έφτασε το μέγιστο επιτρεπτό όριο των " +
          this.app.config["maxExecutionCmd"] +
          " εντολών εκχώρησης.",
        this.cmdLineNo
      ); //FIXME:
  }

  incrLogicalCounter() {
    this.statistics["totalLogicalComp"] += 1;

    if (
      this.statistics["totalLogicalComp"] >= this.app.config["maxLogicalComp"]
    )
      throw new GE.GError(
        "Το πρόγραμμα έφτασε το μέγιστο επιτρεπτό όριο των " +
          this.app.config["maxLogicalComp"] +
          " συνθηκών.",
        this.cmdLineNo
      ); //FIXME:
  }
}

module.exports = {
  Statistics,
};
