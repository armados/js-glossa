"use strict";


class GError extends Error {  
    constructor (message) {
      super(message);

      this.name = this.constructor.name
      this.message = 'Προέκυψε σφάλμα. ' + this.message;
      //this.message = 'Προέκυψε σφάλμα. ';

      //console.log(message);
      console.log('Environment: ', process.env.NODE_ENV);
      
      Error.captureStackTrace(this, this.constructor);
    }
  
  }
  
  module.exports = { 
    GError: GError
  };