"use strict";

var Storage = require("./storage");

var IO = require("./io");




class Atom {
  constructor(val) {
    this.val = val;
  }
  resolve(scope) {
    return this;
  }
  jsEquals(jsval) {
    return this.val == jsval;
  }
  getValue() {
    return this.val;
  }
}

class MNumber extends Atom {}
class MBoolean extends Atom {}
class MString extends Atom {}

class BinaryOp {
  constructor(op, A, B) {
    this.op = op;
    this.A = A;
    this.B = B;
  }
  resolve(scope) {

    var a = this.A.resolve(scope).val;
    var b = this.B.resolve(scope).val;

    //console.log('BinOp: ', this.op, ' a=',a, '   b=',b);

    if (this.op == "add") return new MNumber(a + b);
    if (this.op == "sub") return new MNumber(a - b);

    if (this.op == "mul") return new MNumber(a * b);

    if (this.op == "div") {
      if (b == 0) throw new Error("Division by zero");
      return new MNumber(a / b);
    }

    if (this.op == "intdiv") {
      if (b == 0) throw new Error("Division by zero");
      return new MNumber(Math.floor(a / b));
    }

    if (this.op == "intmod") {
      if (b == 0) throw new Error("Division by zero");
      return new MNumber(a % b);
    }

    if (this.op == "pow") return new MNumber(Math.pow(a, b));

    if (this.op == "lt")  return new MBoolean(a < b);
    if (this.op == "gt")  return new MBoolean(a > b); 
    if (this.op == "lte") return new MBoolean(a <= b);
    if (this.op == "gte") return new MBoolean(a >= b);
    if (this.op == "eq")  return new MBoolean(a == b);
    if (this.op == "neq") return new MBoolean(a != b);

    if (this.op == "and") return new MBoolean(a && b);
    
    if (this.op == "or")  return new MBoolean(a || b);
    
  }
}

class BooleanNotOp {
  constructor(A) {
    this.A = A;
  }
  resolve(scope) {
    //if (this.A instanceof MSymbolTable) { this.A = this.A.resolve(scope); }

    var a = this.A.resolve(scope).val;
    return new MBoolean(!a);
  }
}

// ========================

class MSymbol {
  constructor(name) {
    this.name = name;
  }
  resolve(scope) {
    return scope.getSymbol(this.name);
  }
}

class MSymbolTable {
  constructor(name, args) {
    this.name = name;
    this.args = args;
  }

  fetchCellName(scope) {

    var argsResolved = this.args.map(function (arg) {
      return arg.resolve(scope);
    });

    var tblDimensions = this.args.length;

    if      (tblDimensions == 1)
      var cellsymbol = this.name + "[" +  argsResolved[0].val + "]";
    else if (tblDimensions == 2)
      var cellsymbol = this.name + "[" +  argsResolved[0].val + "][" +  argsResolved[1].val + "]";
    else if (tblDimensions == 3)
      var cellsymbol = this.name + "[" +  argsResolved[0].val + "][" +  argsResolved[1].val + "][" +  argsResolved[2].val + "]";
    else
      throw new Error('Unknown table dimensions');

      this.cellName = cellsymbol;
  }
}

class MSymbolTableAssign extends MSymbolTable {
  resolve(scope) {
    this.fetchCellName(scope);
    return new MSymbol(this.cellName);
  }
 }

class MSymbolTableFetch extends MSymbolTable {
  resolve(scope) {
    this.fetchCellName(scope);
    return scope.getSymbol(this.cellName);
  }
}

// ============================

class Scope {
  constructor(parent) {

    this.localStorage = {};

    this.parent = parent ? parent : null;

    if (typeof Scope.globalStorage == "undefined") {
      Scope.globalStorage = {};
    }
  }

  //makeSubScope() {   return new Scope(this)  }

  setInputData(data) {
    globalThis.inputKeyboardData = data;
  }

  getSingleInputData() {

    if (!globalThis.inputKeyboardData.length)
      throw new Error("No input data left..");

    return globalThis.inputKeyboardData.shift();
  }

  hasSymbol(name) {

    if (name in this.localStorage) return true;
    if (name in Scope.globalStorage) return true;

    return false;
  }

  addSymbol(name, obj) {
    // Add new symbol in storage

    if (this.hasSymbol(name))
      throw new Error("addSymbol(): Symbol already exist in memory " + name);

    if      (obj instanceof Storage.STRGlobalScope)
        return Scope.globalStorage[name] = obj;
    else if (obj instanceof Storage.STRLocalScope ||
             obj instanceof Storage.STRTableName)
          return this.localStorage[name] = obj;
    else
      throw new Error('Unknown storage type');
    }

  addSymbolFuncName(name, obj) {
    // Special case when symbol has same name with function and variable
    //console.log('=====> Scope Action: setSymbol()', name , ' <- ', obj);
    //if(this.hasSymbol(name))
    //    throw new Error('addSymbol(): Symbol already exist in memory');
    if (obj instanceof Storage.STRLocalScope)
      return this.localStorage[name] = obj;
     else
      throw new Error('Unknown storage type: ', name, obj);
  }


  setSymbol(name, obj) {

    if (!this.hasSymbol(name))
        throw new Error('setSymbol(): Symbol missing from memory: ' + name);
  

  
   /* if (this.getSymbolObject(name).isLocked())
      throw new Error('setSymbol(): Variable is in use: ' + name);
*/

    if (!obj)
        return this.localStorage[name];

    //console.log('Metavliti: ', this.getSymbol(name).constructor.name, ' | Gia eisodo sthn mnimi',  obj.constructor.name);
    //console.log('setSymbol: name: ', name, ' <--  ',  obj);

    if      (this.getSymbolObject(name) instanceof Storage.STRFloat ||
             this.getSymbolObject(name) instanceof Storage.STRFuncNameFloat) {

      if (!(obj instanceof Storage.STRFloat || obj instanceof MNumber))
        throw new Error('Variable type not match - expected float');

    }
    else if  (this.getSymbolObject(name) instanceof Storage.STRInt ||
              this.getSymbolObject(name) instanceof Storage.STRFuncNameInt) {
                  if (!(obj instanceof Storage.STRInt || obj instanceof MNumber))
        throw new Error('Variable type not match - expected int');

      if (!(Number(obj.val) === obj.val && obj.val % 1 === 0))
        throw new Error('Variable type not match - expected int');


    }
    else if  (this.getSymbolObject(name) instanceof Storage.STRString ||
              this.getSymbolObject(name) instanceof Storage.STRFuncNameString) {
                  if (!(obj instanceof Storage.STRString || obj instanceof MString)) {
                    console.log('name: ', name, 'obj: ', this.getSymbolObject(name), 'obj2: ', obj);
        throw new Error('Variable type not match - expected string');
                  }


    }
    else if  (this.getSymbolObject(name) instanceof Storage.STRBoolean  ||
              this.getSymbolObject(name) instanceof Storage.STRFuncNameBoolean) {
                  if (!(obj instanceof Storage.STRBoolean || obj instanceof MBoolean))
        throw new Error('Variable type not match - expected boolean');

    }
    else
      throw new Error('Unknown symbol type');


    this.localStorage[name].set(obj);

    return this.localStorage[name];
  }

  getSymbol(name) {

    if (name in this.localStorage) 
      return this.localStorage[name].get();
    else if (name in Scope.globalStorage)
      return Scope.globalStorage[name].get();
    else 
      throw new Error('Symbol not found in storage');
  }
  
  getSymbolObject(name) {

    if (name in this.localStorage)
      return this.localStorage[name];
    else if (name in Scope.globalStorage)
      return Scope.globalStorage[name];
    else
    throw new Error('Symbol not found in storage');
  }

}

// =======================================

class Block {
  constructor(block) {
    this.statements = block;
  }
  resolve(scope) {
    this.statements.forEach(function (cmd) {
      //console.log('Type:', cmd);
      //mem(scope);
      cmd.resolve(scope);
    });

    return true;
  }
}

// ===================================

class IfCond {
  constructor(cond, thenBody, condElseIf, moreBody, elseBody) {
    this.cond = cond;
    this.thenBody = thenBody;
    this.condElseIf = condElseIf;
    this.moreBody = moreBody;
    this.elseBody = elseBody;
  }

  resolve(scope) {
    var cond = this.cond;
    var thenBody = this.thenBody;
    var condElseIf = this.condElseIf;
    var moreBody = this.moreBody;
    var elseBody = this.elseBody;

    //console.log('============> IF before : ', cond)
    var condResult = cond.resolve(scope);
    //console.log('===> IF after: ', condResult)

    if (!condResult instanceof MBoolean)
      throw new Error("Condition must be Boolean");

    //console.log('===> IF : ', val)

    if (condResult.val == true) {
      return thenBody.resolve(scope);
    }

    //console.log('elseif conditions: ', this.condElseIf);
    if (condElseIf.length) {
      for (var i = 0; i < condElseIf.length; ++i) {
        var condResult = condElseIf[i].resolve(scope);

        if (!condResult instanceof MBoolean)
          throw new Error("Condition must be Boolean");

        if (condResult.val == true) {
          return moreBody[i].resolve(scope);
        }
      }
    }

    if (elseBody) 
      return elseBody.resolve(scope);

    return true;
  }
}

class WhileLoop {
  constructor(cond, body) {
    this.cond = cond;
    this.body = body;
  }
  resolve(scope) {
    while (true) {
      var condResult = this.cond.resolve(scope);

      if (!condResult instanceof MBoolean)
        throw new Error("Condition must be Boolean");

      if (condResult.jsEquals(false)) break;

      this.body.resolve(scope);
    }

    return true;
  }
}

class DoWhileLoop {
  constructor(cond, body) {
    this.cond = cond;
    this.body = body;
  }
  resolve(scope) {
    do {
      this.body.resolve(scope);

      var condResult = this.cond.resolve(scope);

      if (!condResult instanceof MBoolean)
        throw new Error("Condition must be Boolean");

      if (condResult.jsEquals(true)) break;
    } while (true);

    return true;
  }
}

class ForLoop {
  constructor(variable, initval, finalval, stepval, body) {
    this.variable = variable;
    this.initval = initval;
    this.finalval = finalval;
    this.stepval = stepval;
    this.body = body;
  }
  resolve(scope) {
    var variable = this.variable;
    var initval = this.initval;
    var finalval = this.finalval;
    var stepval = this.stepval;
    var body = this.body;


    //console.log('FOR LOOP CONSTRUCTOR: ', this.variable);

    var v_step = 1;

    if (stepval != "") {
      var tmp = stepval[0].resolve(scope);
      v_step = tmp.val;
    }

    if (v_step == 0)
      throw new Error("If statement with zero step value detected");

    var tmp = initval.resolve(scope);
    var v_initial = tmp.val;

    var tmp = finalval.resolve(scope);
    var v_final = tmp.val;

    //console.log('FORLOOP: var: ', this.variable, ' initial: ', v_initial,'  final: ', v_final, '  step:', v_step);

    //var output = [];

    //console.log('lock state: ', scope.getSymbolObject(this.variable.name).locked);

  //  if (scope.getSymbolObject(this.variable.name).isLocked())
 //     throw new Error('Can not use variable - is in use');

    scope.setSymbol(variable.name, new MNumber(v_initial));
 //   scope.getSymbolObject(this.variable.name).Lock();

    if (v_initial <= v_final && v_step > 0) {
      while (scope.getSymbol(this.variable.name).val <= v_final) {

        //console.log('FORLOOP: ', scope.getSymbol(this.variable.name).val,'  got looped once');

        body.resolve(scope);
        //if (val) output.push(val);

 //       scope.getSymbolObject(this.variable.name).Unlock();
        scope.setSymbol(
          this.variable.name,
          new MNumber(scope.getSymbol(this.variable.name).val + v_step)
        );
  //      scope.getSymbolObject(this.variable.name).Lock();

      }
    } else if (v_initial >= v_final && v_step < 0) {
      while (scope.getSymbol(variable.name).val >= v_final) {
        //console.log('  got looped once var value: ', scope.getSymbol(this.variable.name).val);

        
        body.resolve(scope);
        
        //if (val) output.push(val);

        scope.setSymbol(
          this.variable.name,
          new MNumber(scope.getSymbol(this.variable.name).val + v_step)
        );
      }
    }

    //scope.getSymbolObject(this.variable.name).Unlock();

    //return output.join("\n");
  }
}

class Assignment {
  constructor(sym, val) {
    this.symbol = sym;
    this.val = val;
  }
  resolve(scope) {
    //console.log('== Assignment: INIT RESOLVE symbol: ', this.symbol, ' value: ', this.val);
    var valResolved = this.val.resolve(scope);

    //console.log('== Assignment: BEFORE RESOLVE symbol: ', this.symbol, ' value: ', valResolved);

    var sym = this.symbol;

    if (sym instanceof MSymbolTableAssign) { //FIXME: IdentifierTblFetch
        sym = this.symbol.resolve(scope);
    }
 
    //console.log('== Assignment: AFTER RESOLVE symbol: ', sym, ' value: ', valResolved);

    /* ?????????
    if (valResolved instanceof MSymbol) 
      valResolved = valResolved.resolve(scope);
    else if (valResolved instanceof MSymbolTable) 
      valResolved = valResolved.resolve(scope);
      */
     
    scope.setSymbol(sym.name, valResolved);

    //console.log('AFTER Assignment: ', sym.name, '  has now value: ', scope.getSymbol(sym.name));
    //mem(scope);

    return true;
  }
}

class Stmt_write {
  constructor(args) {
    this.args = args;
  }
  resolve(scope) {
    //console.log('GRAPSE: ', this.args);

    var output = [];

    this.args.forEach(function (argParam) {
      //console.log('write: before resolve: ', argParam);

      if (argParam instanceof MSymbolTableFetch)
          argParam = argParam.resolve(scope);

      var arg = argParam.resolve(scope);

      //console.log('write: after resolve: ', arg);

      //mem(scope);
      try {
        if (arg instanceof MBoolean) {
          output.push(arg.getValue() ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ");
          //console.log("OUT1: ", arg.getValue() ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ");
        } else {
          output.push(arg.getValue());
          //console.log("OUT2: ", arg.getValue());
        }
      } catch (err) {
        console.log('Σφάλμα. Η μεταβλητή δεν έχει αρχικοποιηθεί. ' , argParam.name);
        //throw new Error("Parameter not initialized: " + argParam.name);
      }
    });

    globalThis.ScreenOutput.push(output.join(" "));

    return true;
  }
}

class Stmt_read {
  constructor(params) {
    this.params = params;
  }
  resolve(scope) {
    var inputData = [];

    //console.log("read params: ", this.params);

    this.params.forEach(function (param) {
      //console.log("param: ", param);

      // Check if is a table cell - if true fetch real symbol
      if (param instanceof MSymbolTableAssign)
          param = param.resolve(scope);

      //console.log("Read from keyboard: ", param.name);

      var data = IO.inputData.shift();//scope.getSingleInputData();

      inputData.push("*** Εισαγωγή τιμής από πληκτρολόγιο: [" + data + "]");

      if      (typeof(data) == 'boolean') var sym = new MBoolean(data);
      else if (typeof(data) == 'string')  var sym = new MString(data);
      else if (typeof(data) == 'number')  var sym = new MNumber(data);
      else 
        throw new Error('Error: cannon detect type for the input value');
            
      scope.setSymbol(param.name, sym);
    });

    globalThis.ScreenOutput.push( inputData.join( "\n" ) );

    return true;
  }
}

class DefDeclarations {
  constructor(statheres, metavlites) {
    this.statheres = statheres;
    this.metavlites = metavlites;
  }
  resolve(scope) {

    //console.log("===> Declaring constants");
    if (this.statheres[0]) this.statheres[0].forEach(function (e) {
      // console.log('statheres :', e);
      e.resolve(scope);
    });

    //console.log("===> Declaring variables");
    if(this.metavlites[0]) this.metavlites[0].forEach(function (e) {
      //console.log('var type  varcat:', e);
      e.resolve(scope);
    });

    //console.log("===> end of declerations");

    return true;
  }
}

class DefConstant {
  constructor(sym, val) {
    this.sym = sym;
    this.val = val;
  }
  resolve(scope) {
    //console.log('===> DefConstant: Create constants symbol name: ', this.sym.name, ' with value: ', this.val.resolve(scope));

    var obj = this.val.resolve(scope);
  
    if      (Number(obj.val) === obj.val && obj.val % 1 === 0)
      var newObj = new Storage.STRInt( obj );
    else if (Number(obj.val) === obj.val && obj.val % 1 !== 0)
      var newObj = new Storage.STRFloat( obj );
    else if (typeof(obj.val) == 'string')
      var newObj = new Storage.STRString( obj );
    else if (typeof(obj.val) == 'boolean')
      var newObj = new Storage.STRBoolean( obj );
    else
      throw new Error('Unknown constant type');

    return scope.addSymbol(this.sym.name, newObj );
  }
}


class DefVariables {
  constructor(varType, sym) {
    this.varType = varType;
    this.sym = sym;
  }

  resolve(scope) {

    var varType = this.varType;
    //console.log('======> DefVariables: : ', varType);

    this.sym.forEach(function (e) {

      //console.log('======> DefVariables: Create variable symbol name: ', e.name, varType, e);

      if (e instanceof MSymbolTable) {

        //console.log('======> DefVariables: Create variable TABLE symbol name: ', e.name, varType);

        var argsResolved = e.args.map(function (arg) {
          return arg.resolve(scope);
        });
 
        if  (varType == 'ΑΚΕΡΑΙΕΣ')
          var ctype = new Storage.STRTableName( argsResolved );
        else if (varType == 'ΠΡΑΓΜΑΤΙΚΕΣ')
          var ctype = new Storage.STRTableName( argsResolved );
        else if (varType == 'ΧΑΡΑΚΤΗΡΕΣ')
          var ctype = new Storage.STRTableName( argsResolved );
        else if (varType == 'ΛΟΓΙΚΕΣ')
          var ctype = new Storage.STRTableName( argsResolved );
        else
          throw new Error('Unknown variable type');
    
        // Add to local storage symbol for table name
        scope.addSymbol(e.name, ctype );




        function helperCreateCellFromType(varType) {
          if  (varType == 'ΑΚΕΡΑΙΕΣ')
            return new Storage.STRInt( null );
          else if (varType == 'ΠΡΑΓΜΑΤΙΚΕΣ')
            return new Storage.STRFloat( null );
          else if (varType == 'ΧΑΡΑΚΤΗΡΕΣ')
            return new Storage.STRString( null );
          else if (varType == 'ΛΟΓΙΚΕΣ')
            return new Storage.STRBoolean( null );
          else
            throw new Error('Unknown variable type');
        }
      



        // Initialize table cells
        var tblDimensions = argsResolved.length;

        if (tblDimensions == 1) {
          var tblsize1 = argsResolved[0].val;
          for (var i = 1; i <= tblsize1; ++i) {
            //console.log('   Create table element : ', i);
            scope.addSymbol(e.name + "[" + i + "]", helperCreateCellFromType(varType));
          }
      } else if (tblDimensions == 2) {
          var tblsize1 = argsResolved[0].val;
          var tblsize2 = argsResolved[1].val;
          for (var i = 1; i <= tblsize1; ++i) {
            for (var j = 1; j <= tblsize2; ++j) {
              //console.log('   Create table element : ', i, ' ', j);
            scope.addSymbol(e.name + "[" + i + "][" + j + "]", helperCreateCellFromType(varType));
          }
        }
      } else if (tblDimensions == 3) {
        var tblsize1 = argsResolved[0].val;
        var tblsize2 = argsResolved[1].val;
        var tblsize3 = argsResolved[2].val;
        for (var i = 1; i <= tblsize1; ++i) {
          for (var j = 1; j <= tblsize2; ++j) {
            for (var k = 1; k <= tblsize3; ++k) {
              //console.log('   Create table element : ', i, ' ', j);
          scope.addSymbol(e.name + "[" + i + "][" + j + "][" + k + "]", helperCreateCellFromType(varType));
        }
      }
    }
    } else
        throw new Error('Unsupported table dimensions');

        return true;
      }
      




      if  (varType == 'ΑΚΕΡΑΙΕΣ')
      var ctype = new Storage.STRInt( null );
    else if (varType == 'ΠΡΑΓΜΑΤΙΚΕΣ')
      var ctype = new Storage.STRFloat( null );
    else if (varType == 'ΧΑΡΑΚΤΗΡΕΣ')
      var ctype = new Storage.STRString( null );
    else if (varType == 'ΛΟΓΙΚΕΣ')
      var ctype = new Storage.STRBoolean( null );
    else
      throw new Error('Cannot detect variable type');
  
      return scope.addSymbol(e.name, ctype);
 








    }); 
  }
}


class FunctionCall {
  constructor(fun, args) {
    this.fun = fun;
    this.args = args;
  }
  resolve(scope) {
    //console.log("F step1 called ====: ", this.fun.name, " with args ", this.args);

    //lookup the real function from the symbol
    if (!scope.hasSymbol(this.fun.name))
      throw new Error("FunctionCall: cannot resolve symbol " + this.fun.name);

    var argsResolved = this.args.map(function (arg) {
      return arg.resolve(scope);
    });

    //console.log("F step2 calcualted args ====: ", this.fun.name, " with args ", argsResolved);

    var fun = scope.getSymbol(this.fun.name);

    var retValue = fun.apply(this, argsResolved);

    //console.log('F step3 returned  ====: ', retValue);

    // Return function value
    return retValue;
  }
}

class ProcedureCall {
  constructor(fun, args) {
    this.fun = fun;
    this.args = args;
  }

  resolve(scope) {
    //console.log("P step1 called ====: ", this.fun.name, " with args ", this.args);

    //lookup the real function from the symbol
    if (!scope.hasSymbol(this.fun.name))
      throw new Error("ProcedureCall: cannot resolve symbol " + this.fun.name);

    var argsResolved = this.args.map(function (arg) {
      return arg.resolve(scope);
    });

    //console.log("P step2 calcualted args ====: ", this.fun.name, " with args ", argsResolved);

    var fun = scope.getSymbol(this.fun.name);

    var procExecArr = fun.apply(null, argsResolved);

    var procScope  = procExecArr[0];
    var procParams = procExecArr[1];

    this.args.map(function (arg, i) {

      if (arg instanceof MSymbol) {
        // Return values from procedure
        // Take care in case of a variable is locked and returned changed value
        //scope.setSymbol(arg.name, procScope.getSymbol(procParams[i].name));
        if (true || !scope.getSymbolObject(arg.name).isLocked()) { // FIXME:
          scope.setSymbol(arg.name, procScope.getSymbol(procParams[i].name));
        } else {
          //console.log('check change: ', scope.getSymbol(arg.name), procScope.getSymbol(procParams[i].name));

          if (scope.getSymbol(arg.name) != procScope.getSymbol(procParams[i].name))
            throw new Error('Procedure return values try to change ariable which is in use');

        }

      }
    });

    //console.log('P step3 returned  ====: ', procExecArr);

    return true;
  }
}
/*
class TblCellWrite {
  constructor(name, args) {
    this.name = name;
    this.args = args;
  }

  resolve(scope) {
    console.log("TblCellWrite: Table resolve called ====: ", this.name," with args ", this.args );

    //lookup the real function from the symbol
    var argsResolved = this.args.map(function (arg) {
      return arg.resolve(scope);
    });

    var cellName = this.name;// + "[" + argsResolved[0].val + "]";

    //console.log("Tbl request cellName====: ", cellName);

    if (!scope.hasSymbol(this.name))
      throw new Error("TblCellWrite: cannot resolve symbol " + cellName);
    //FIXME: return table value here

    //console.log("tbl write debug: ", scope.getSymbol(cellName));
    return new MSymbol(cellName); //scope.getSymbol( cellName );
  }
}

class TblCellRead {
    constructor(name, args) {
      this.name = name;
      this.args = args;
    }
  
    resolve(scope) {
      console.log("TblCellRead: Table resolve called ====: ", this.name, " with args ", this.args);

      //lookup the real function from the symbol  
      var argsResolved = this.args.map(function (arg) {
        return arg.resolve(scope);
      });
  
      var cellName = this.name + "[" + argsResolved[0].val + "]";
  
      //console.log("Tbl request cellName====: ", cellName);
  
      if (!scope.hasSymbol(cellName))
        throw new Error("TblCellRead: cannot resolve symbol " + cellName);
  
      //console.log("tbl debug: ", scope.getSymbol(cellName));
      return scope.getSymbol( cellName );
    }
  }
*/


class SubFunction {
  constructor(name, params, funType, decl, body) {
    this.name = name;
    this.params = params;
    this.funType = funType;
    this.decl = decl;
    this.body = body;
  }

  resolve(scope) {
    var name = this.name.name;
    var params = this.params;
    var funType = this.funType;
    var decl = this.decl;
    var body = this.body;

    scope.addSymbol(name, new Storage.STRUserFunction(function (...args) {
      //console.log('func called ', name, ' with args: ', args);

     if (args.length != params.length)
        throw new Error(
          "Error different number of parameters for function call"
        );

      var scope2 = new Scope();

      // Crate function name variable in local scope
      if  (funType == 'ΑΚΕΡΑΙΑ')
        var ftype = new Storage.STRFuncNameInt( null );
      else if (funType == 'ΠΡΑΓΜΑΤΙΚΗ')
        var ftype = new Storage.STRFuncNameFloat( null );
      else if (funType == 'ΧΑΡΑΚΤΗΡΑΣ')
        var ftype = new Storage.STRFuncNameString( null );
      else if (funType == 'ΛΟΓΙΚΗ')
        var ftype = new Storage.STRFuncNameBoolean( null );
      else
        throw new Error('Cannot detect function return value type');      
      
      scope2.addSymbolFuncName(name,  ftype);


      // Declare constants and variables
      decl.resolve(scope2);

      params.forEach(function (param, i) {
        if (!scope2.hasSymbol(param.name))
        throw new Error(
          "Parameter not declared inside procedure: " + param.name
        );

        scope2.setSymbol(param.name, args[i]);
      });

      //mem(scope2);

      body.resolve(scope2);

      //mem(scope2);

      if (!scope2.getSymbol(name))
        throw new Error("Function must return a value in the func name");

      return scope2.getSymbol(name);
    }));

    return true;
  }
}

class SubProcedure {
  constructor(name, params, decl, body) {
    this.name = name;
    this.params = params;
    this.decl = decl;
    this.body = body;
  }

  resolve(scope) {
    var name = this.name.name;
    var params = this.params;
    var decl = this.decl;
    var body = this.body;

    scope.addSymbol(name, new Storage.STRUserProcedure(function (...args) {
      //console.log('proc called ', name, ' with args: ', args);

      if (args.length != params.length)
        throw new Error(
          "Error different number of parameters for procedure call"
        );
 
      var scope2 = new Scope();

      // Declare constants and variables
      decl.resolve(scope2);

      params.forEach(function (param, i) {
        if (!scope2.hasSymbol(param.name))
          throw new Error(
            "Parameter not declared inside procedure: " + param.name
          );

        scope2.setSymbol(param.name, args[i]);
      });

      //mem(scope2);

      body.resolve(scope2);

      //mem(scope2);

      var procExecArr = [scope2, params];

      return procExecArr;
    }));

    return true;
  }
}

class Program {
  constructor(name, decl, body) {
    this.name = name;
    this.decl = decl;
    this.body = body;
  }

  resolve(scope) {

    var newScope = new Scope();

    //mem(newScope);

    // Program name is reserved word in global scope
    newScope.addSymbol(this.name.name, new Storage.STRReservedName(null));

    // Declare constants and variables
    this.decl.resolve(newScope);

    //mem(newScope);

    this.body.resolve(newScope);

    //mem(newScope);

    return true;
  }
}

class Application {
  constructor(mainProg, subPrograms) {
    this.mainProg = mainProg;
    this.subPrograms = subPrograms;
  }
  resolve(scope) {

    var newScope = new Scope();

    globalThis.ScreenOutput = [];

    if (this.subPrograms.length)
      this.subPrograms.forEach((e) => e.resolve(scope));

    //mem(scope);

    this.mainProg.resolve(newScope);

    return globalThis.ScreenOutput.join('\n');;
  }
}

function mem(scope) {
  console.log("\n============================[ Memory dump  ]");
  console.log("RAM Global storage: ", Scope.globalStorage);
  console.log("RAM  Local storage: ", scope.localStorage);
  console.log("\n");
}

module.exports = {
  MNumber: MNumber,
  MBoolean: MBoolean,
  MString: MString,

  BinaryOp: BinaryOp,
  BooleanNotOp: BooleanNotOp,

  MSymbol: MSymbol,

  MSymbolTableAssign: MSymbolTableAssign,
  MSymbolTableFetch: MSymbolTableFetch,

  Scope: Scope,

  Assignment: Assignment,
  
  Block: Block,

  IfCond: IfCond,
  WhileLoop: WhileLoop,
  DoWhileLoop: DoWhileLoop,
  ForLoop: ForLoop,

  FunctionCall: FunctionCall,
  ProcedureCall: ProcedureCall,

  Stmt_write: Stmt_write,
  Stmt_read: Stmt_read,

  Application: Application,
  Program: Program,

  DefDeclarations: DefDeclarations,

  DefConstant: DefConstant,
  DefVariables: DefVariables,

  SubFunction: SubFunction,
  SubProcedure: SubProcedure,

  //TblCellWrite: TblCellWrite,
  //TblCellRead: TblCellRead,
};
