"use strict";


class GError extends Error {  
    constructor (message) {
      super(message);

      Error.captureStackTrace(this, this.constructor);
  
      this.name = this.constructor.name

      console.log('Got GError: ', message);
    }
  
  }
  
  module.exports = { 
    GError: GError
  };