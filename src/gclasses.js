"use strict";

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
      "Τερματισμός." +
      (line != null ? " Γραμμή " + line + ". " : " ") +
      this.message;
  }
}


class GInternalError extends Error {
  constructor(message, line = null) {
    super(message);

    this.name = this.constructor.name;
    
    this.message =
      "FIXME Please.. Εσωτερικό Σφάλμα." +
      (line != null ? " Γραμμή " + line + ". " : " ") +
      this.message;
  }
}

module.exports = {
  GError,
  GInterrupt,
  GInternalError
};
