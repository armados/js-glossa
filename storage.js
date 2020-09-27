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

class STRGlobalScope { constructor(obj) {
     this.obj = obj;
    }
    get() { return this.obj; }
    set(obj) { this.obj = obj; }
}

class STRLocalScope {
    constructor(obj) {
        this.obj = obj;
        this.locked = false;
    }
      get() { return this.obj; }
      set(obj) { this.obj = obj; }

  /*    getType() {
        return typeof(this.obj);
      } */
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

class STRReservedName extends STRGlobalScope {}

class STRFunctionMethod extends STRGlobalScope {}
class STRProcedureMethod extends STRGlobalScope {}

class STRBuiltinFunction extends STRFunctionMethod {}

class STRUserFunction  extends STRFunctionMethod {}
class STRUserProcedure extends STRProcedureMethod {}

// ============

class STRNumber   extends STRLocalScope{}

class STRFloat    extends STRNumber {}
class STRInteger  extends STRFloat {} 
class STRString   extends STRLocalScope{}
class STRBoolean  extends STRLocalScope{}

class STRVarFloat extends STRFloat{}
class STRVarInt extends STRInteger{}
class STRVarString extends STRString{}
class STRVarBoolean extends STRBoolean{}

class STRFunctionNameFloat extends STRFloat{}
class STRFunctionNameInt extends STRInteger{}
class STRFunctionNameString extends STRString{}
class STRFunctionNameBoolean extends STRBoolean{}

class STRConstFloat extends STRFloat{ locked = true; }
class STRConstInt extends STRInteger{ locked = true; }
class STRConstString extends STRString{ locked = true; }
class STRConstBoolean extends STRBoolean{ locked = true; }

// ============

class STRTable {
  constructor( tbldef) {
    this.data = []
    this.tbldef = tbldef;

    this.createTable();
}
  getDimensions() { return this.tbl_size; }

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


  createTableCell() {

  }
}

class STRTableFloat extends STRTable{ createTableCell() { return new STRVarFloat(null); }}
class STRTableInt extends STRTable { createTableCell() { return new STRVarInt(null); }}
class STRTableString extends STRTable { createTableCell() { return new STRVarString(null); }}
class STRTableBoolean extends STRTable { createTableCell() { return new STRVarBoolean(null); }}



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
    STRInteger: STRInteger, 
    STRString: STRString,   
    STRBoolean: STRBoolean, 
    
    STRVarFloat: STRVarFloat,
    STRVarInt: STRVarInt, 
    STRVarString: STRVarString, 
    STRVarBoolean: STRVarBoolean, 
    
    STRFunctionNameFloat: STRFunctionNameFloat, 
    STRFunctionNameInt: STRFunctionNameInt, 
    STRFunctionNameString: STRFunctionNameString, 
    STRFunctionNameBoolean: STRFunctionNameBoolean,
    
    STRConstFloat: STRConstFloat, 
    STRConstInt: STRConstInt, 
    STRConstString: STRConstString, 
    STRConstBoolean: STRConstBoolean,
    
    STRTable: STRTable,
    STRTableFloat: STRTableFloat,
    STRTableInt: STRTableInt,
    STRTableString: STRTableString,
    STRTableBoolean: STRTableBoolean,

}

