"use strict";

class STRScope {
   constructor(obj) { this.obj = obj; }
   get()    { return this.obj; }
   set(obj) { this.obj = obj; }
}

class STRGlobalScope extends STRScope {} 

class STRLocalScope extends STRScope {}

class STRReservedName extends STRGlobalScope {}

class STRFunctionMethod extends STRGlobalScope {}
class STRProcedureMethod extends STRGlobalScope {}

class STRBuiltinFunction extends STRFunctionMethod {}

class STRUserFunction  extends STRFunctionMethod {}
class STRUserProcedure extends STRProcedureMethod {}

// ============

class STRNumber   extends STRLocalScope{}
class STRFloat    extends STRNumber {}
class STRInt      extends STRFloat {} 
class STRString   extends STRLocalScope{}
class STRBoolean  extends STRLocalScope{}

class STRFuncNameFloat   extends STRFloat {}
class STRFuncNameInt     extends STRInt {}
class STRFuncNameString  extends STRString {}
class STRFuncNameBoolean extends STRBoolean {}

class STRTableName {
  constructor(tblsize) {
    this.tblsize = tblsize;
  }

}

// ============


module.exports = {

    STRGlobalScope: STRGlobalScope,
    STRLocalScope: STRLocalScope,
    
    STRReservedName: STRReservedName,
    
    STRFunctionMethod: STRFunctionMethod,
    STRProcedureMethod: STRProcedureMethod,
    
    STRBuiltinFunction: STRBuiltinFunction,
    
    STRUserFunction: STRUserFunction, 
    STRUserProcedure: STRUserProcedure,
    
    STRNumber: STRNumber,  
    STRFloat: STRFloat,
    STRInt: STRInt, 
    STRString: STRString,   
    STRBoolean: STRBoolean, 
        
    STRFuncNameFloat: STRFuncNameFloat, 
    STRFuncNameInt: STRFuncNameInt, 
    STRFuncNameString: STRFuncNameString, 
    STRFuncNameBoolean: STRFuncNameBoolean,
    
    STRTableName: STRTableName,
}

