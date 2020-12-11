"use strict";

const Atom = require("./atom");
const GE = require("./gclasses");




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
    this.io = null;
    this.cmdLineNo = null;

    this.statistics = {}
    this.statistics['totalAssignCmd'] = 0;
    this.statistics['totalLogicalComp'] = 0;

    this.config = {}
    this.config['maxExecutionCmd'] = 10000;
    this.config['maxLogicalComp'] = 5000;

    if (parent) {
      this.globalStorage = parent.globalStorage;
      this.io = parent.io;
      this.statistics = parent.statistics;
      this.config = parent.config;
      this.cmdLineNo = parent.cmdLineNo;
    }

    }

  makeSubScope() {   
    return new SScope(this);
  }

  isLocked(name) {
    return this.lockedVariables.includes(name);
  }

  addLock(name) {
    if (this.isLocked(name)) throw new GE.GError('Critical: addLock() Symbol already locked ' + name);

    this.lockedVariables.push(name);
  }

  removeLock(name) {
    if (!this.isLocked(name)) throw new GE.GError('Critical: removeLock() Symbol not locked ' + name);

    const index = this.lockedVariables.indexOf(name);
    this.lockedVariables.splice(index, 1);
  }
 
  incrAssignCounter() {
    this.statistics['totalAssignCmd'] = this.statistics['totalAssignCmd'] + 1;

    if (this.statistics['totalAssignCmd'] >=  this.config['maxExecutionCmd'])
      throw new GE.GError('Το πρόγραμμα έφτασε το μέγιστο επιτρεπτό όριο των ' + this.config['maxExecutionCmd'] + ' εντολών εκχώρησης.', this.cmdLineNo); //FIXME:
  }

   
  incrLogicalCounter() {
    this.statistics['totalLogicalComp'] = this.statistics['totalLogicalComp'] + 1;

    if (this.statistics['totalLogicalComp'] >=  this.config['maxLogicalComp'])
      throw new GE.GError('Το πρόγραμμα έφτασε το μέγιστο επιτρεπτό όριο των ' + this.config['maxLogicalComp'] + ' συνθηκών.', this.cmdLineNo); //FIXME:
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
      throw new GE.GError('Critical: addSymbol(): Symbol already used ' + name);
      
    if (obj instanceof STRGlobalScope)
      return this.globalStorage[name] = obj;
    
    if (obj instanceof STRLocalScope || obj instanceof STRTableName)
      return this.localStorage[name] = obj;
    
    throw new GE.GError('Critical: Unknown storage type');
    }

  addSymbolFuncName(name, obj) {
    if (obj instanceof STRLocalScope)
      return this.localStorage[name] = obj;
    
    throw new GE.GError('Critical: addSymbolFuncName(): Unknown storage type');
  }

  setSymbol(name, obj) {
    
    if (!this.hasSymbol(name))
        throw new GE.GError('Το αναγνωριστικό ' + name + ' δεν βρέθηκε στο τμήμα δηλώσεων.', this.cmdLineNo); //FIXME: 

    if (!obj)
        return;

    if (this.isLocked(name))
      throw new GE.GError('Το αναγνωριστικό ' + name + ' δεν μπορεί να χρησιμοποιηθεί.', this.cmdLineNo); //FIXME: 

    var symType = null;

    if      (this.getSymbolObject(name) instanceof STRInt)
      symType = "ΑΚΕΡΑΙΑ";
    else if (this.getSymbolObject(name) instanceof STRFuncNameInt)
      symType = "ΑΚΕΡΑΙΑ (ονομα συνάρτησης)";
    else if (this.getSymbolObject(name) instanceof STRTableNameInt)
      symType = "ΑΚΕΡΑΙΑ (στοιχείο σε πίνακα)";
    else if (this.getSymbolObject(name) instanceof STRFloat) 
      symType = "ΠΡΑΓΜΑΤΙΚΗ";
    else if (this.getSymbolObject(name) instanceof STRFuncNameFloat)
      symType = "ΠΡΑΓΜΑΤΙΚΗ (ονομα συνάρτησης)";
    else if (this.getSymbolObject(name) instanceof STRTableNameFloat)
      symType = "ΠΡΑΓΜΑΤΙΚΗ (στοιχείο σε πίνακα)";
    else if (this.getSymbolObject(name) instanceof STRString)
      symType = "ΧΑΡΑΚΤΗΡΑΣ";
    else if (this.getSymbolObject(name) instanceof STRFuncNameString)
      symType = "ΧΑΡΑΚΤΗΡΑΣ (ονομα συνάρτησης)";
    else if (this.getSymbolObject(name) instanceof STRTableNameString)
      symType = "ΧΑΡΑΚΤΗΡΑΣ (στοιχείο σε πίνακα)";
    else if (this.getSymbolObject(name) instanceof STRBoolean)
      symType = "ΛΟΓΙΚΗ";
    else if (this.getSymbolObject(name) instanceof STRFuncNameBoolean)
      symType = "ΛΟΓΙΚΗ (όνομα συνάρτησης)";
    else if (this.getSymbolObject(name) instanceof STRTableNameBoolean)
      symType = "ΛΟΓΙΚΗ (στοιχείο σε πίνακα)";
    else
      throw new GE.GError('Critical: 01 Unknown symbol type' + this.getSymbol(name));
    

     //console.log('setSymbol: ', name, symType, ' <--  ',  obj, obj.constructor.name);

     if      (this.getSymbolObject(name) instanceof STRInt ||
              this.getSymbolObject(name) instanceof STRTableNameInt ||
              this.getSymbolObject(name) instanceof STRFuncNameInt) {
      if (!(obj instanceof STRInt || obj instanceof Atom.MNumber))
        throw new GE.GError('Το αναγνωριστικό ' + name + ' λαμβάνει μόνο ΑΚΕΡΑΙΕΣ τιμές.', this.cmdLineNo); //FIXME: 

      if (!(Number(obj.val) === obj.val && obj.val % 1 === 0))
        throw new GE.GError('Το αναγνωριστικό ' + name + ' λαμβάνει μόνο ΑΚΕΡΑΙΕΣ τιμές.', this.cmdLineNo); //FIXME: 

    }
    else if (this.getSymbolObject(name) instanceof STRFloat ||
             this.getSymbolObject(name) instanceof STRFuncNameFloat) {

      if (!(obj instanceof STRFloat || obj instanceof Atom.MNumber))
        throw new GE.GError('Το αναγνωριστικό ' + name + ' λαμβάνει μόνο ΠΡΑΓΜΑΤΙΚΕΣ τιμές.', this.cmdLineNo); //FIXME: 

    }
    else if  (this.getSymbolObject(name) instanceof STRString ||
              this.getSymbolObject(name) instanceof STRFuncNameString) {
      if (!(obj instanceof STRString || obj instanceof Atom.MString)) 
        throw new GE.GError('Το αναγνωριστικό ' + name + ' λαμβάνει μόνο ΑΛΦΑΡΙΘΜΗΤΙΚΕΣ τιμές.', this.cmdLineNo); //FIXME: 
 
    }
    else if  (this.getSymbolObject(name) instanceof STRBoolean  ||
              this.getSymbolObject(name) instanceof STRFuncNameBoolean) {
      if (!(obj instanceof STRBoolean || obj instanceof Atom.MBoolean))
        throw new GE.GError('Το αναγνωριστικό ' + name + ' λαμβάνει μόνο ΛΟΓΙΚΕΣ τιμές.', this.cmdLineNo); //FIXME: 

    }
    else
      throw new GE.GError('Critical: 02 Unknown symbol type' + this.getSymbol(name));

    //console.log("Θέσε στο " +  name + " την τιμή " + obj.val);
    //this.io.outputAddDetails('[#] Θέσε στο ' +  name + ' την τιμή ' + obj.val);
    //console.log('FF NAME: ' + name);
    //console.log(this.localStorage[name]);
    this.localStorage[name].set(obj);

    //FIXME: oxi edw mono tis entoles this.incrAssignCounter();
  }

  getSymbol(name) {
    if (name in this.localStorage) 
      return this.localStorage[name].get();
    
    throw new GE.GError('Critical:: 01 Internal??? Το αναγνωριστικό ' + name + ' δεν έχει δηλωθεί στο τμήμα δηλώσεων.', this.cmdLineNo); //FIXME: 
  }

  getGlobalSymbol(name) {

    if (name in this.globalStorage)
      return this.globalStorage[name].get();
     
    throw new GE.GError('Critical:: 02 Internal??? Το αναγνωριστικό ' + name + ' δεν έχει δηλωθεί στο τμήμα δηλώσεων.', this.cmdLineNo); //FIXME: 
  }  

  getSymbolObject(name) {
    if (name in this.localStorage)
      return this.localStorage[name];
    
    if (name in this.globalStorage)
      return this.globalStorage[name];
    
    throw new GE.GError('Critical:: 03 Internal???Το αναγνωριστικό ' + name + ' δεν έχει δηλωθεί στο τμήμα δηλώσεων.', this.cmdLineNo); //FIXME: 
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


