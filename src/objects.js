"use strict";

var Atom = require("./atom");
var GE = require("./gclasses");

var STR = require("./storage");
var IO = require("./io");

var IOKeyboard = null;
var IOScreen = new IO.OutputDevice();



// ========================

class MSymbol {
  constructor(name) {
    this.name = name;
  }
  resolve(scope) {
    return scope.getSymbol(this.name);
  }
}

// ========================

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
      throw new GE.GError('Unknown table dimensions');

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

class Block {
  constructor(block) {
    this.statements = block;
  }
  resolve(scope) {
    //mem(scope);
    this.statements.forEach(function (smtp) {
      //console.log('==========> User command smtp: ', smtp);
      smtp.resolve(scope);
    });

    return true;
  }
}

// ===================================

class Stmt_IfCond {
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

    var condResult = cond.resolve(scope);

    if (!(condResult instanceof Atom.MBoolean))
      throw new GE.GError("Condition must be Boolean");

    if (condResult.val == true)
      return thenBody.resolve(scope);

    if (condElseIf.length)
      for (var i = 0; i < condElseIf.length; ++i) {
        var condResult = condElseIf[i].resolve(scope);

        if (!condResult instanceof Atom.MBoolean)
          throw new GE.GError("Condition must be Boolean");

        if (condResult.val == true) {
          return moreBody[i].resolve(scope);
        }
      }
    
    if (elseBody) 
      return elseBody.resolve(scope);
  }
}

class Stmt_WhileLoop {
  constructor(cond, body) {
    this.cond = cond;
    this.body = body;
  }
  resolve(scope) {
    while (true) {
      var condResult = this.cond.resolve(scope);

      if (!condResult instanceof Atom.MBoolean)
        throw new GE.GError("Condition must be Boolean");

      if (condResult.jsEquals(false))
        break;

      this.body.resolve(scope);
    }
  }
}

class Stmt_Do_WhileLoop {
  constructor(cond, body) {
    this.cond = cond;
    this.body = body;
  }
  resolve(scope) {
    do {
      this.body.resolve(scope);

      var condResult = this.cond.resolve(scope);

      if (!condResult instanceof Atom.MBoolean)
        throw new GE.GError("Condition must be Boolean");

      if (condResult.jsEquals(true))
        break;
    } while (true);
  }
}

class Stmt_ForLoop {
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

    var v_step = 1;

    if (stepval != "") {
      var tmp = stepval[0].resolve(scope);
      v_step = tmp.val;
    }

    if (v_step == 0)
      throw new GE.GError("If statement with zero value step detected");

    var tmp = initval.resolve(scope);
    var v_initial = tmp.val;

    var tmp = finalval.resolve(scope);
    var v_final = tmp.val;

    //console.log('Stmt_ForLoop: var: ', this.variable, ' initial: ', v_initial,'  final: ', v_final, '  step:', v_step);

    if (scope.isLocked(variable.name))
      throw new GE.GError('Can not use variable - is in use');

    scope.setSymbol(variable.name, new Atom.MNumber(v_initial));
    scope.addLock(variable.name);

    //mem(scope);

    if (v_initial <= v_final && v_step > 0) {
      while (scope.getSymbol(variable.name).val <= v_final) {

        body.resolve(scope);

        scope.removeLock(variable.name);
        scope.setSymbol(
          this.variable.name,
          new Atom.MNumber(scope.getSymbol(variable.name).val + v_step)
        );
        scope.addLock(variable.name);

      }
    } else if (v_initial >= v_final && v_step < 0) {
      while (scope.getSymbol(variable.name).val >= v_final) {
    
        body.resolve(scope);
        
        scope.removeLock(variable.name);
        scope.setSymbol(
          this.variable.name,
          new Atom.MNumber(scope.getSymbol(variable.name).val + v_step)
        );
        scope.addLock(variable.name);
      }
    }

    scope.removeLock(variable.name);
  }
}

class Stmt_Assignment {
  constructor(sym, val) {
    this.symbol = sym;
    this.val = val;
  }
  resolve(scope) {
    //console.log('== Stmt_Assignment: BEFORE RESOLVE symbol: ', this.symbol, ' value: ', this.val);
    var valResolved = this.val.resolve(scope);
    //console.log('== Stmt_Assignment: AFTER RESOLVE symbol: ', this.symbol, ' value: ', valResolved);

    var sym = this.symbol;

    if (scope.isLocked(sym.name))
      throw new GE.GError('Can not use variable - is in use');

    if (sym instanceof MSymbolTableAssign) { 
        sym = this.symbol.resolve(scope);
    }
 
    //console.log('== Stmt_Assignment: AFTER RESOLVE symbol: ', sym, ' value: ', valResolved);

    /* ?????????
    if (valResolved instanceof MSymbol) 
      valResolved = valResolved.resolve(scope);
    else if (valResolved instanceof MSymbolTable) 
      valResolved = valResolved.resolve(scope);
      */
     
    scope.setSymbol(sym.name, valResolved);

    //console.log('AFTER Stmt_Assignment: ', sym.name, '  has now value: ', scope.getSymbol(sym.name));
    //mem(scope);
  }
}

class Stmt_Write {
  constructor(args) {
    this.args = args;
  }
  resolve(scope) {

    var output = [];

    this.args.forEach(function (argParam) {
      //console.log('write: before resolve: ', argParam);

      if (argParam instanceof MSymbolTableFetch)
          argParam = argParam.resolve(scope);

      var arg = argParam.resolve(scope);

      //console.log('write: after resolve: ', arg);

      //mem(scope);
      try {
        if (arg instanceof Atom.MBoolean) {
          output.push(arg.getValue() ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ");
          //console.log("OUT1: ", arg.getValue() ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ");
        } else {
          output.push(arg.getValue());
          //console.log("OUT2: ", arg.getValue());
        }
      } catch (err) {
        console.log('Σφάλμα. Η μεταβλητή δεν έχει αρχικοποιηθεί. ' , argParam.name);
        throw new GE.GError("Parameter not initialized: " + argParam.name);
      }
    });

    IOScreen.add( output.join(" ") );
  }
}

class Stmt_Read {
  constructor(params) {
    this.params = params;
  }
  resolve(scope) {
    var inputData = [];

    //console.log("read params: ", this.params);

    this.params.forEach(function (param) {
      //console.log("param: ", param);

      if (scope.isLocked(param.name))
        throw new GE.GError('Can not use variable - is in use');

      // Check if is a table cell - if true fetch real symbol
      if (param instanceof MSymbolTableAssign)
          param = param.resolve(scope);

      //console.log("Read from keyboard: ", param.name);

      var data = IOKeyboard.getSingleInputData();
      //console.log("got from keyboard: ", data);

      inputData.push("*** Εισαγωγή τιμής από πληκτρολόγιο: [" + data + "]");

      if      (typeof(data) == 'string')  var sym = new Atom.MString(data);
      else if (typeof(data) == 'number')  var sym = new Atom.MNumber(data);
      else 
        throw new GE.GError('Unknown input value type: ' + data + typeof(data));
            
      scope.setSymbol(param.name, sym);
    });

    IOScreen.add( inputData.join( "\n" ) );
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
      e.resolve(scope);
    });

    //console.log("===> Declaring variables");
    if(this.metavlites[0]) this.metavlites[0].forEach(function (e) {
      e.resolve(scope);
    });

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
      var newObj = new STR.STRInt( obj );
    else if (Number(obj.val) === obj.val && obj.val % 1 !== 0)
      var newObj = new STR.STRFloat( obj );
    else if (typeof(obj.val) == 'string')
      var newObj = new STR.STRString( obj );
    else if (typeof(obj.val) == 'boolean')
      var newObj = new STR.STRBoolean( obj );
    else
      throw new GE.GError('Unknown constant type');

      scope.addSymbol(this.sym.name, newObj )
      scope.addLock(this.sym.name);
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
          return arg.resolve(scope).val;
        });
 
        if      (varType == 'ΑΚΕΡΑΙΕΣ')
          var ctype = new STR.STRTableNameInt( e.name, argsResolved );
        else if (varType == 'ΠΡΑΓΜΑΤΙΚΕΣ')
          var ctype = new STR.STRTableNameFloat( e.name, argsResolved );
        else if (varType == 'ΧΑΡΑΚΤΗΡΕΣ')
          var ctype = new STR.STRTableNameString( e.name, argsResolved );
        else if (varType == 'ΛΟΓΙΚΕΣ')
          var ctype = new STR.STRTableNameBoolean( e.name, argsResolved );
        else
          throw new GE.GError('Unknown variable type');
    
        // Add to local STR symbol for table name
        scope.addSymbol(e.name, ctype );




        function helperCreateCellFromType(varType) {
          if      (varType == 'ΑΚΕΡΑΙΕΣ')
            return new STR.STRInt( null );
          else if (varType == 'ΠΡΑΓΜΑΤΙΚΕΣ')
            return new STR.STRFloat( null );
          else if (varType == 'ΧΑΡΑΚΤΗΡΕΣ')
            return new STR.STRString( null );
          else if (varType == 'ΛΟΓΙΚΕΣ')
            return new STR.STRBoolean( null );
          else
            throw new GE.GError('Unknown variable type');
        }
      



        // Initialize table cells
        var tblDimensions = argsResolved.length;

        if (tblDimensions == 1) {
          var tblsize1 = argsResolved[0];
          for (var i = 1; i <= tblsize1; ++i) {
            //console.log('   Create table element : ', i);
            scope.addSymbol(e.name + "[" + i + "]", helperCreateCellFromType(varType));
          }
      } else if (tblDimensions == 2) {
          var tblsize1 = argsResolved[0];
          var tblsize2 = argsResolved[1];
          for (var i = 1; i <= tblsize1; ++i) {
            for (var j = 1; j <= tblsize2; ++j) {
              //console.log('   Create table element : ', i, ' ', j);
            scope.addSymbol(e.name + "[" + i + "][" + j + "]", helperCreateCellFromType(varType));
          }
        }
      } else if (tblDimensions == 3) {
        var tblsize1 = argsResolved[0];
        var tblsize2 = argsResolved[1];
        var tblsize3 = argsResolved[2];
        for (var i = 1; i <= tblsize1; ++i) {
          for (var j = 1; j <= tblsize2; ++j) {
            for (var k = 1; k <= tblsize3; ++k) {
              //console.log('   Create table element : ', i, ' ', j);
          scope.addSymbol(e.name + "[" + i + "][" + j + "][" + k + "]", helperCreateCellFromType(varType));
        }
      }
    }
    } else
        throw new GE.GError('Unsupported table dimensions');

        return true;
      }

    if      (varType == 'ΑΚΕΡΑΙΕΣ')
      var ctype = new STR.STRInt( null );
    else if (varType == 'ΠΡΑΓΜΑΤΙΚΕΣ')
      var ctype = new STR.STRFloat( null );
    else if (varType == 'ΧΑΡΑΚΤΗΡΕΣ')
      var ctype = new STR.STRString( null );
    else if (varType == 'ΛΟΓΙΚΕΣ')
      var ctype = new STR.STRBoolean( null );
    else
      throw new GE.GError('Cannot detect variable type');
  
      return scope.addSymbol(e.name, ctype);

    }); 
  }
}


class CallSubFunction {
  constructor(fun, args) {
    this.fun = fun;
    this.args = args;
  }
  resolve(scope) {
    //console.log("F step1 called ====: ", this.fun.name, " with args ", this.args);

    //lookup the real function from the symbol
    if (!scope.hasSymbol(this.fun.name))
      throw new GE.GError("CallSubFunction: cannot resolve symbol " + this.fun.name);

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


class CallSubProcedure {
  constructor(fun, args) {
    this.fun = fun;
    this.args = args;
  }

  resolve(scope) {

    //mem(scope);

    //console.log("P step1 called ====: ", this.fun.name, " with args ", this.args);

    //lookup the real function from the symbol
    if (!scope.hasSymbol(this.fun.name))
      throw new GE.GError("CallSubProcedure: cannot resolve symbol " + this.fun.name);

    //console.log("P step1 called ==mid step");

    var argsResolved = this.args.map(function (arg) {
      //return arg.resolve(scope);

        return arg.resolve(scope);

    });

    //console.log("P step2 calcualted args ====: ", this.fun.name, " with argsResolved ", argsResolved);

    var fun = scope.getSymbol(this.fun.name);
    //console.log('before apply procedure');
    var procExecArr = fun.apply(null, argsResolved);
    //console.log('after  apply procedure');

    var procScope  = procExecArr[0];
    var procParams = procExecArr[1];
 
    this.args.map(function (arg, i) {
      
      if  (arg instanceof MSymbol) {

        if (scope.isLocked(arg.name) == true &&
            scope.getSymbol(arg.name) != procScope.getSymbol(procParams[i].name))
          throw new GE.GError('Procedure return values try to change variable which is in use');
    
        scope.setSymbol(arg.name, procScope.getSymbol(procParams[i].name));

      }
      else if (arg instanceof STRTableName) {

        // Return symbol from arg cell name
        console.log('send whole table');
        scope.setSymbol(arg.cellName, procScope.getSymbol(procParams[i].name));
      }

    });

    //console.log('P step3 returned  ====: ', procExecArr);
  }
}


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

    scope.addSymbol(name, new STR.STRUserFunction(function (...args) {
      //console.log('func called ', name, ' with args: ', args);

     if (args.length != params.length)
        throw new GE.GError(
          "Error different number of parameters for function call"
        );

      var scope2 = scope.makeSubScope();

      if      (funType == 'ΑΚΕΡΑΙΑ')
        var ftype = new STR.STRFuncNameInt( null );
      else if (funType == 'ΠΡΑΓΜΑΤΙΚΗ')
        var ftype = new STR.STRFuncNameFloat( null );
      else if (funType == 'ΧΑΡΑΚΤΗΡΑΣ')
        var ftype = new STR.STRFuncNameString( null );
      else if (funType == 'ΛΟΓΙΚΗ')
        var ftype = new STR.STRFuncNameBoolean( null );
      else
        throw new GE.GError('Cannot detect function return value type');      
      
      // Crate function name variable in local scope
      scope2.addSymbolFuncName(name, ftype);

      // Declare constants and variables
      decl.resolve(scope2);

      // Sent values to function
      params.forEach(function (param, i) {
        if (!scope2.hasSymbol(param.name))
        throw new GE.GError(
          "Parameter not declared inside procedure: " + param.name
        );

        scope2.setSymbol(param.name, args[i]);
      });

      //mem(scope2);

      body.resolve(scope2);

      //mem(scope2);

      if (!scope2.getSymbol(name))
        throw new GE.GError("Function must return a value in the func name");

      return scope2.getSymbol(name);
    }));
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

    scope.addSymbol(name, new STR.STRUserProcedure(function (...args) {
      //console.log('proc called ', name, ' with args: ', args);

      if (args.length != params.length)
        throw new GE.GError(
          "Error different number of parameters for procedure call"
        );
 
      var scope2 = scope.makeSubScope();

      // Declare constants and variables
      decl.resolve(scope2);
console.log('inside procedure ready to start commands');
      // Sent values to procedure
      params.forEach(function (param, i) {
        if (!scope2.hasSymbol(param.name))
          throw new GE.GError(
            "Parameter not declared inside procedure: " + param.name
          );
        
          if (!(args[i] instanceof STR.STRTableName))
            scope2.setSymbol(param.name, args[i]);
            else {
              console.log('Check tables...');
              console.log(args[i]);

              if (scope2.getSymbol(param.name).constructor.name != args[i].constructor.name)
                throw new GE.GError('Tables not same type');
              
              if (!scope2.getSymbol(param.name).arraySizeEquals(args[i]))
                throw new GE.GError('Tables not same size');

                var tblDimensions = scope2.getSymbol(param.name).getSize().length;

                if (tblDimensions == 1) {
                  var tblsize1 = args[i].getSize()[0];
                  for (var j = 1; j <= tblsize1; ++j) {
                    console.log(param.name + "[" + j + "]");
                    console.log(args[i].tblname + "[" + j + "]");
                    console.log(scope.getSymbol(args[i].tblname + "[" + j + "]"));
                    scope2.setSymbol(param.name + "[" + j + "]", scope.getSymbol(args[i].tblname + "[" + j + "]"));
                  }
              } else if (tblDimensions == 2) {
                  var tblsize1 = argsResolved[0];
                  var tblsize2 = argsResolved[1];
                  for (var i = 1; i <= tblsize1; ++i) {
                    for (var j = 1; j <= tblsize2; ++j) {
                      //console.log('   Create table element : ', i, ' ', j);
                    scope.addSymbol(e.name + "[" + i + "][" + j + "]", helperCreateCellFromType(varType));
                  }
                }
              } else if (tblDimensions == 3) {
                var tblsize1 = argsResolved[0];
                var tblsize2 = argsResolved[1];
                var tblsize3 = argsResolved[2];
                for (var i = 1; i <= tblsize1; ++i) {
                  for (var j = 1; j <= tblsize2; ++j) {
                    for (var k = 1; k <= tblsize3; ++k) {
                      //console.log('   Create table element : ', i, ' ', j);
                  scope.addSymbol(e.name + "[" + i + "][" + j + "][" + k + "]", helperCreateCellFromType(varType));
                }
              }
            }
            }







            }
      });

      //mem(scope2);

      body.resolve(scope2);

      //mem(scope2);

      var procExecArr = [scope2, params];

      // Return scope for precessing 
      return procExecArr;
    }));
  }
}

class Program {
  constructor(name, decl, body) {
    this.name = name;
    this.decl = decl;
    this.body = body;
  }

  resolve(scope) {

    var newScope = scope.makeSubScope();

    // Program name is reserved word in global scope
    newScope.addSymbol(this.name.name, new STR.STRReservedName(null));

    // Declare constants and variables
    this.decl.resolve(newScope);

    //mem(newScope);

    this.body.resolve(newScope);
  }
}

class Application {
  constructor(keyboardData, mainProg, subPrograms) {
    this.mainProg = mainProg;
    this.subPrograms = subPrograms;
    this.keyboardData = keyboardData;
  }
  resolve(argIOKeyboard) {
    
    if (argIOKeyboard != null && argIOKeyboard != '') {
      IOKeyboard = new IO.InputDevice();
      //console.log('Keyboard buffer argIOKeyboard: ', argIOKeyboard);
      var arrKeyboard = argIOKeyboard.split(',').map(item => item.trim());
      arrKeyboard.forEach( function (e) { IOKeyboard.add(e); })
    }
    else
      IOKeyboard = new IO.InputDevice();

    
    var scope = new STR.SScope();

    if (IOKeyboard.isEmpty() && this.keyboardData.length) {
      //console.log('>> Setting keyboard buffer from inline source code');
      this.keyboardData.forEach((e) => e.addKeyboardInputData(scope));
    }

    IOScreen.data = []; // FIXME: 

    scope.addSymbol("Α_Μ",  new STR.STRBuiltinFunction(function (A) {
      return new Atom.MNumber(Math.trunc(A.val / 1));
    }));
    
    scope.addSymbol("Α_Τ",  new STR.STRBuiltinFunction(function (A) {
      if (A.val < 0) return new Atom.MNumber(-A.val);
      return A;
    }));
    
    scope.addSymbol("Τ_Ρ",  new STR.STRBuiltinFunction(function (A) {
      if (A.val < 0) throw new GE.GError("Σφάλμα. Δεν ορίζεται ρίζα αρνητικού αριθμού");
      return new Atom.MNumber( Math.sqrt(A.val) );
    }));
    
    scope.addSymbol("ΗΜ",  new STR.STRBuiltinFunction(function (A) {
      return new Atom.MNumber( Math.sin(A.val) );
    }));
    
    scope.addSymbol("ΣΥΝ",  new STR.STRBuiltinFunction(function (A) {
      return new Atom.MNumber( Math.cos(A.val) );
    }));
    
    scope.addSymbol("Ε",  new STR.STRBuiltinFunction(function (A) {
      return new Atom.MNumber( Math.exp(A.val) );
    }));
    
    scope.addSymbol("ΕΦ",  new STR.STRBuiltinFunction(function (A) {
      return new Atom.MNumber( Math.tan(A.val) );
    }));
    
    scope.addSymbol("ΛΟΓ",  new STR.STRBuiltinFunction(function (A) {
      return new Atom.MNumber( Math.log(A.val) );
    }));

    if (this.subPrograms.length)
      this.subPrograms.forEach((e) => e.resolve(scope));

    //mem(scope);

    this.mainProg.resolve(scope);

    return IOScreen.get().join('\n');;
  }
}



function mem(scope) {
  console.log("\n============================[ Memory dump  ]");
  console.log("RAM Global storage: ", scope.globalStorage);
  console.log("RAM  Local storage: ", scope.localStorage);
  console.log("Local Variables Locked: ", scope.lockedVariables);
  console.log("\n");
}


class KeyboardDataFromSource {
  constructor(args) {
    this.args = args;
  }
 
  addKeyboardInputData(scope) {

    var argsResolved = this.args.map(function (arg) {
      return arg.resolve(scope);
    });

    argsResolved.forEach(function (e) {
      //console.log(' attachInputData KEYBOARD_DATA: ', e.val);
      IOKeyboard.add(e.val);
    }); 

  }
  }



module.exports = {

  MSymbol: MSymbol,

  MSymbolTableAssign: MSymbolTableAssign,
  MSymbolTableFetch: MSymbolTableFetch,

  Stmt_Assignment: Stmt_Assignment,
  
  Block: Block,

  Stmt_IfCond: Stmt_IfCond,
  Stmt_WhileLoop: Stmt_WhileLoop,
  Stmt_Do_WhileLoop: Stmt_Do_WhileLoop,
  Stmt_ForLoop: Stmt_ForLoop,

  CallSubFunction: CallSubFunction,
  CallSubProcedure: CallSubProcedure,

  Stmt_Write: Stmt_Write,
  Stmt_Read: Stmt_Read,

  Application: Application,
  Program: Program,

  DefDeclarations: DefDeclarations,

  DefConstant: DefConstant,
  DefVariables: DefVariables,

  SubFunction: SubFunction,
  SubProcedure: SubProcedure,

  KeyboardDataFromSource: KeyboardDataFromSource,
};
