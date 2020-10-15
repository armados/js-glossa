"use strict";


class GError extends Error {  
    constructor (message) {
      super(message);

      Error.captureStackTrace(this, this.constructor);
      
      this.name = this.constructor.name
      this.message = 'Προέκυψε σφάλμα. ' + this.message;
      //this.message = 'Προέκυψε σφάλμα. ';

      //console.log(message);
      //Error.stackTraceLimit = 0;

    }
  
  }
  
  module.exports = { 
    GError: GError
  };