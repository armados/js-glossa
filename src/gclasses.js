"use strict";


class GError extends Error {  
    constructor (message) {
      super(message);

      this.name = this.constructor.name
      this.message = 'Προέκυψε σφάλμα. ' + this.message;

      console.log(message);
      
      Error.captureStackTrace(this, this.constructor);
    }
  
  }
  
  module.exports = { 
    GError: GError
  };