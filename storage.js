"use strict";

/*

----- global scope

ProgramName     reserved - not for use

BuiltinFunction  extends function

UserFunction     extedns function

---- local scope

FunctionName  extends Metavliti         (spacial case, allow to add)

Metavliti
=Akeraia    extends number
=Pragmatiki extends number
=Xarakthras
=Logiki

Stathera
=Akeraia    extends number
=Pragmatiki extends number
=Xarakthras
=Logiki

*/

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
/*
class STRTableNameFloat   extends STRTable {}
class STRTableNameInt     extends STRTable {}
class STRTableNameString  extends STRTable {}
class STRTableNameBoolean extends STRTable {}
*/

// ============


/*
class STRTable {
  constructor( tbldef) {
    this.data = []
    this.tbldef = tbldef;
    this.locked = false;

    this.createTable();
}
  getDimensions() { return this.tbl_size; }


  get(args) { 
    if (this.getDimensions() == 1) {
      var d1 =  this.args[0].val;
      console.log('d1:', d1,' data:', this.data);
      return this.data[d1];
    } else if (this.getDimensions() == 2) {
      var d1 =  this.args[0].val;
      var d2 =  this.args[1].val;
      return this.data[d1][d2];

    //return this.obj;
   }
  }
  set(obj) { this.obj = obj; }


  createTable() {
    var tblDimensions = this.tbldef.length;

    //console.log('table size to create: ', tblDimensions);

    if (tblDimensions == 1) {
      var tblsize1 =  this.tbldef[0].val;
      for (var i = 1; i <= tblsize1; ++i) {
        console.log('   Create table element : ', i);
        this.data[i] = this.createTableCell();
        //scope.addSymbol(e.name + "[" + i + "]", null);
      }
  } else if (tblDimensions == 2) {
      var tblsize1 =  this.tbldef[0].val;
      var tblsize2 =  this.tbldef[1].val;
      for (var i = 1; i <= tblsize1; ++i) {
        var inner = [];
        for (var j = 1; j <= tblsize2; ++j) {
          console.log('   Create table element : ', i, ' ', j);
          inner[j] = this.createTableCell();

        //scope.addSymbol(e.name + "[" + i + "][" + j + "]", null);
      }
      this.data[i] = inner;


    }
  }



  }


  createTableCell() { }





  isLocked() {
    return this.locked;
  }
  Lock() {
    this.locked = true;
  }
  Unlock() {
    this.locked = false;
  }
}
*/



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

