"use strict";


class GError extends Error {  
    constructor (message) {
      super(message);

      this.name = this.constructor.name
      console.log('Σφάλμα: ', message);
      Error.captureStackTrace(this, this.constructor);
    }
  
  }
  
  module.exports = { 
    GError: GError
  };