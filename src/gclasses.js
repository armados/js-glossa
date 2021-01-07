"use strict";

class GError extends Error {
  constructor(message, line = null) {
    super(message);

    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    
    this.message =
      "Σφάλμα." +
      (line != null ? " Γραμμή " + line + ". " : " ") +
      this.message;
  }
}

module.exports = {
  GError
};
