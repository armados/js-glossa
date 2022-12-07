"use strict";

class GSyntaxError extends Error {
  constructor(message, line = null) {
    super(message);

    this.name = this.constructor.name;
    
    this.message =
      "Σφάλμα." +
      (line != null ? " Γραμμή " + line + ". " : " ") +
      this.message;
  }
}

class GError extends Error {
  constructor(message, line = null) {
    super(message);

    this.name = this.constructor.name;
    
    this.message =
      "Σφάλμα." +
      (line != null ? " Γραμμή " + line + ". " : " ") +
      this.message;
  }
}


class GInterrupt extends Error {
  constructor(message, line = null) {
    super(message);

    this.name = this.constructor.name;
    
    this.message =
      "Διακοπή εκτέλεσης." +
      (line != null ? " Γραμμή " + line + ". " : " ") +
      this.message;
  }
}


class GInternalError extends Error {
  constructor(message, line = null) {
    super(message);

    this.name = this.constructor.name;
    
    this.message =
      "Εσωτερικό Σφάλμα." +
      (line != null ? " Γραμμή " + line + ". " : " ") +
      this.message;
  }
}

module.exports = {
  GSyntaxError,
  GError,
  GInterrupt,
  GInternalError
};
