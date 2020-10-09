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
    this.localStorage = {};
    this.lockedVariables = [];

    if (typeof this.globalStorage == "undefined") {
      this.globalStorage = {};
    }

    if (parent) {
      this.globalStorage = parent.globalStorage;
    }

  }

  makeSubScope() {   return new SScope(this)  }

  isLocked(name) {
    return this.lockedVariables.includes(name);
  }

  addLock(name) {
      this.lockedVariables.push(name);
      }

  removeLock(name) {
        const index = this.lockedVariables.indexOf(name);
        this.lockedVariables.splice(index, 1);
  }
  
  hasSymbol(name) {

    if (name in this.localStorage) return true;
    if (name in this.globalStorage) return true;

    return false;
  }

  addSymbol(name, obj) {
    // Add new symbol in storage

    if (this.hasSymbol(name))
      throw new GE.GError("addSymbol(): Symbol already exist in memory " + name);
      
    if      (obj instanceof STRGlobalScope)
        return this.globalStorage[name] = obj;
    else if (obj instanceof STRLocalScope ||
             obj instanceof STRTableName)
          return this.localStorage[name] = obj;
    else
      throw new GE.GError('Unknown storage type');
     
    }

  addSymbolFuncName(name, obj) {
    // Special case when symbol has same name with function and variable
    //console.log('=====> Scope Action: setSymbol()', name , ' <- ', obj);
    //if(this.hasSymbol(name))
    //    throw new GE.GError('addSymbol(): Symbol already exist in memory');
    if (obj instanceof STRLocalScope)
      return this.localStorage[name] = obj;
     else
      throw new GE.GError('Unknown storage type: ', name, obj);
  }


  setSymbol(name, obj) {

    if (!this.hasSymbol(name))
        throw new GE.GError('setSymbol(): Symbol missing from memory: ' + name);
  

  
   /* if (this.getSymbolObject(name).isLocked())
      throw new GE.GError('setSymbol(): Variable is in use: ' + name);
*/

    if (!obj)
        return this.localStorage[name];
        var symType = null;
             if (this.getSymbolObject(name) instanceof STRInt)
          symType = "ΑΚΕΡΑΙΑ";
        else if (this.getSymbolObject(name) instanceof STRFuncNameInt)
          symType = "ΑΚΕΡΑΙΑ (ονομα συνάρτησης)";
        else if      (this.getSymbolObject(name) instanceof STRFloat) 
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
          symType = "ΛΟΓΙΚΗ (ονομα συνάρτησης)";
        else
          throw new GE.GError('Unknown symbol type' + this.getSymbol(name));
    

    //console.log('setSymbol: ', name, symType, ' <--  ',  obj, obj.constructor.name);

     if      (this.getSymbolObject(name) instanceof STRInt ||
              this.getSymbolObject(name) instanceof STRFuncNameInt) {
                  if (!(obj instanceof STRInt || obj instanceof Atom.MNumber))
        throw new GE.GError('Variable type not match - expected int');

      if (!(Number(obj.val) === obj.val && obj.val % 1 === 0))
        throw new GE.GError('Variable type not match - expected int');


    }
    else if (this.getSymbolObject(name) instanceof STRFloat ||
             this.getSymbolObject(name) instanceof STRFuncNameFloat) {

      if (!(obj instanceof STRFloat || obj instanceof Atom.MNumber))
        throw new GE.GError('Variable type not match - expected float');

    }
    else if  (this.getSymbolObject(name) instanceof STRString ||
              this.getSymbolObject(name) instanceof STRFuncNameString) {
                  if (!(obj instanceof STRString || obj instanceof Atom.MString)) {
                    //console.log('name: ', name, 'obj: ', this.getSymbolObject(name), 'obj2: ', obj);
        throw new GE.GError('Variable type not match - expected string');
                  }


    }
    else if  (this.getSymbolObject(name) instanceof STRBoolean  ||
              this.getSymbolObject(name) instanceof STRFuncNameBoolean) {
                  if (!(obj instanceof STRBoolean || obj instanceof Atom.MBoolean))
        throw new GE.GError('Variable type not match - expected boolean');

    }
    else
      throw new GE.GError('Unknown symbol type' + this.getSymbol(name));


    this.localStorage[name].set(obj);

    return this.localStorage[name];
  }

  getSymbol(name) {

    if (name in this.localStorage) 
      return this.localStorage[name].get();
    else if (name in this.globalStorage)
      return this.globalStorage[name].get(); //FIXME: return Scope.globalStorage[name].get();
    else 
      throw new GE.GError('Symbol not found in storage');
  }
  
  getSymbolObject(name) {

    if (name in this.localStorage)
      return this.localStorage[name];
    else if (name in this.globalStorage)
      return this.globalStorage[name]; //FIXME:  return Scope.globalStorage[name];
    else
    throw new GE.GError('Symbol not found in storage');
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


