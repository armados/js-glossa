"use strict";

var Atom = require("./atom");
var GE = require("./gclasses");


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
  constructor(tblname, tblsize) {
    this.tblname = tblname;
    this.tblsize = tblsize;
  }
  get()    { return this; }
  getSize()    { return this.tblsize; }
  arraySizeEquals(anothertable) {
    var a = anothertable.getSize();
    var b = this.getSize();
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
  }

}

class STRTableNameFloat   extends STRTableName {}
class STRTableNameInt     extends STRTableName {}
class STRTableNameString  extends STRTableName {}
class STRTableNameBoolean extends STRTableName {}

// ============

class SScope {
  constructor(parent) {
    this.globalStorage = {};
    this.localStorage  = {};
    this.lockedVariables = [];

    if (parent)
      this.globalStorage = parent.globalStorage;
  }

  makeSubScope() {   
    return new SScope(this);
  }

  isLocked(name) {
    return this.lockedVariables.includes(name);
  }

  addLock(name) {
    if (this.isLocked(name)) throw new GE.GError('Το αναγνωριστικό ' + name + ' δεν μπορεί να χρησιμοποιηθεί');

    this.lockedVariables.push(name);
  }

  removeLock(name) {
    if (!this.isLocked(name)) throw new GE.GError('Symbol not locked ' + name);

    const index = this.lockedVariables.indexOf(name);
    this.lockedVariables.splice(index, 1);
  }
 
  printMemory() {
    console.log("\n============================[ Memory dump  ]");
    console.log("RAM Global storage: ", this.globalStorage);
    console.log("RAM  Local storage: ", this.localStorage);
    console.log("Local Variables Locked: ", this.lockedVariables);
    console.log("\n");
  }
  
  hasSymbol(name) {
    return (name in this.localStorage) || (name in this.globalStorage);
  }

  addSymbol(name, obj) {
    if (this.hasSymbol(name))
      throw new GE.GError("Χρησιμοποιείται ήδη το αναγνωριστικό " + name);
      
    if (obj instanceof STRGlobalScope)
      return this.globalStorage[name] = obj;
    
    if (obj instanceof STRLocalScope || obj instanceof STRTableName)
      return this.localStorage[name] = obj;
    
    throw new GE.GError('Unknown storage type');
    }

  addSymbolFuncName(name, obj) {
    if (obj instanceof STRLocalScope)
      return this.localStorage[name] = obj;
    
    throw new GE.GError('Unknown storage type');
  }

  setSymbol(name, obj) {

    if (!this.hasSymbol(name))
        throw new GE.GError('Δεν βρέθηκε το αναγνωριστικό ' + name);

    if (!obj)
        return;

    if (this.isLocked(name))
      throw new GE.GError('Το αναγνωριστικό είναι δεσμευμένο ' + name);

    var symType = null;

    if      (this.getSymbolObject(name) instanceof STRInt)
      symType = "ΑΚΕΡΑΙΑ";
    else if (this.getSymbolObject(name) instanceof STRFuncNameInt)
      symType = "ΑΚΕΡΑΙΑ (ονομα συνάρτησης)";
    else if (this.getSymbolObject(name) instanceof STRFloat) 
      symType = "ΠΡΑΓΜΑΤΙΚΗ";
    else if (this.getSymbolObject(name) instanceof STRFuncNameFloat)
      symType = "ΠΡΑΓΜΑΤΙΚΗ (ονομα συνάρτησης)";
    else if (this.getSymbolObject(name) instanceof STRString)
      symType = "ΧΑΡΑΚΤΗΡΑΣ";
    else if (this.getSymbolObject(name) instanceof STRFuncNameString)
      symType = "ΧΑΡΑΚΤΗΡΑΣ (ονομα συνάρτησης)";
    else if (this.getSymbolObject(name) instanceof STRBoolean)
      symType = "ΛΟΓΙΚΗ";
    else if (this.getSymbolObject(name) instanceof STRFuncNameBoolean)
      symType = "ΛΟΓΙΚΗ (όνομα συνάρτησης)";
    else
      throw new GE.GError('Unknown symbol type' + this.getSymbol(name));
    

    //console.log('setSymbol: ', name, symType, ' <--  ',  obj, obj.constructor.name);

     if      (this.getSymbolObject(name) instanceof STRInt ||
              this.getSymbolObject(name) instanceof STRFuncNameInt) {
      if (!(obj instanceof STRInt || obj instanceof Atom.MNumber))
        throw new GE.GError('Το αναγνωριστικό ' + name + ' λαμβάνει μόνο ΑΚΕΡΑΙΕΣ τιμές');

      if (!(Number(obj.val) === obj.val && obj.val % 1 === 0))
        throw new GE.GError('Το αναγνωριστικό ' + name + ' λαμβάνει μόνο ΑΚΕΡΑΙΕΣ τιμές');

    }
    else if (this.getSymbolObject(name) instanceof STRFloat ||
             this.getSymbolObject(name) instanceof STRFuncNameFloat) {

      if (!(obj instanceof STRFloat || obj instanceof Atom.MNumber))
        throw new GE.GError('Το αναγνωριστικό ' + name + ' λαμβάνει μόνο ΠΡΑΓΜΑΤΙΚΕΣ τιμές');

    }
    else if  (this.getSymbolObject(name) instanceof STRString ||
              this.getSymbolObject(name) instanceof STRFuncNameString) {
      if (!(obj instanceof STRString || obj instanceof Atom.MString)) 
        throw new GE.GError('Το αναγνωριστικό ' + name + ' λαμβάνει μόνο ΑΛΦΑΡΙΘΜΗΤΙΚΕΣ τιμές');
 
    }
    else if  (this.getSymbolObject(name) instanceof STRBoolean  ||
              this.getSymbolObject(name) instanceof STRFuncNameBoolean) {
      if (!(obj instanceof STRBoolean || obj instanceof Atom.MBoolean))
        throw new GE.GError('Το αναγνωριστικό ' + name + ' λαμβάνει μόνο ΛΟΓΙΚΕΣ τιμές');

    }
    else
      throw new GE.GError('Unknown symbol type' + this.getSymbol(name));

    this.localStorage[name].set(obj);
  }

  getSymbol(name) {

    if (name in this.localStorage) 
      return this.localStorage[name].get();
    
    if (name in this.globalStorage)
      return this.globalStorage[name].get();
     
    throw new GE.GError('Μη δηλωμένο αναγνωριστικό με όνομα ' + name);
  }
  
  getSymbolObject(name) {

    if (name in this.localStorage)
      return this.localStorage[name];
    
    if (name in this.globalStorage)
      return this.globalStorage[name];
    
    throw new GE.GError('Μη δηλωμένο αναγνωριστικό με όνομα ' + name);
  }

}





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

    STRTableNameFloat: STRTableNameFloat, 
    STRTableNameInt: STRTableNameInt, 
    STRTableNameString: STRTableNameString, 
    STRTableNameBoolean: STRTableNameBoolean,
    
    SScope: SScope,
}


