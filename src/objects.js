"use strict";

var Atom = require("./atom");
var GE   = require("./gclasses");
var STR  = require("./storage");

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
      throw new GE.GError('Critical: Unknown table dimensions');

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

class Stmt_Block {
  constructor(block) {
    this.statements = block;
  }
  resolve(scope) {
    this.statements.forEach(function (smtp) {
      smtp.resolve(scope);
    });
  }
}

// ===================================

class Stmt_IfCond {
  constructor(cond, condstr, thenBody, condElseIf, moreBody, elseBody) {
    this.cond = cond;
    this.condstr = condstr;
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
      throw new GE.GError('Η συνθήκη της ΑΝ δεν αποτελεί λογική έκφραση.');

    scope.io.outputAddDetails('Η συνθήκη της ΑΝ ' +  this.condstr + ' έχει τιμή ' +  (condResult.val ? 'ΑΛΗΘΗΣ':'ΨΕΥΔΗΣ'));

    if (condResult.val == true)
      return thenBody.resolve(scope);

    if (condElseIf.length)
      for (var i = 0; i < condElseIf.length; ++i) {
        var condResult = condElseIf[i].resolve(scope);

        if (!(condResult instanceof Atom.MBoolean))
          throw new GE.GError('Η συνθήκη της ΑΛΛΙΩΣ_ΑΝ δεν αποτελεί λογική έκφραση.');

          if (condResult.val == true) {
          return moreBody[i].resolve(scope);
        }
      }
    
    if (elseBody) 
      return elseBody.resolve(scope);
  }
}

class Stmt_WhileLoop {
  constructor(cond, condstr, body) {
    this.cond = cond;
    this.condstr = condstr;
    this.body = body;
  }
  resolve(scope) {
    while (true) {
      var condResult = this.cond.resolve(scope);

      if (!(condResult instanceof Atom.MBoolean))
        throw new GE.GError('Η συνθήκη της ΟΣΟ δεν αποτελεί λογική έκφραση.');

      scope.io.outputAddDetails('Η συνθήκη της ΟΣΟ ' +  this.condstr + ' έχει τιμή ' + (condResult.val ? 'ΑΛΗΘΗΣ':'ΨΕΥΔΗΣ'));

      if (!condResult.val)
        break;

      this.body.resolve(scope);
    }
  }
}

class Stmt_Do_WhileLoop {
  constructor(cond, condstr, body) {
    this.cond = cond;
    this.condstr = condstr;
    this.body = body;
  }
  resolve(scope) {
    do {

      this.body.resolve(scope);

      var condResult = this.cond.resolve(scope);

      if (!(condResult instanceof Atom.MBoolean))
        throw new GE.GError('Η συνθήκη της ΜΕΧΡΙΣ_ΟΤΟΥ δεν αποτελεί λογική έκφραση.');

      scope.io.outputAddDetails('Η συνθήκη της ΜΕΧΡΙΣ_ΟΤΟΥ ' +  this.condstr + ' έχει τιμή ' +  (condResult.val ? 'ΑΛΗΘΗΣ':'ΨΕΥΔΗΣ'));

      if (condResult.val)
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
      throw new GE.GError('Μη επιτρεπτή ενέργεια. Το βήμα της εντολή ΓΙΑ δεν μπορεί να λάβει την τιμή μηδέν.');

    var tmp = initval.resolve(scope);
    var v_initial = tmp.val;

    var tmp = finalval.resolve(scope);
    var v_final = tmp.val;

    scope.setSymbol(variable.name, new Atom.MNumber(v_initial));
    scope.addLock(variable.name);

    if (v_initial <= v_final && v_step > 0) {
      while (scope.getSymbol(variable.name).val <= v_final) {
        scope.io.outputAddDetails('Η συνθήκη της ΓΙΑ ' + variable.name + '<=' + v_final + ' είναι ΑΛΗΘΗΣ');
   
        body.resolve(scope);

        scope.removeLock(variable.name);
        scope.setSymbol(
          this.variable.name,
          new Atom.MNumber(scope.getSymbol(variable.name).val + v_step)
        );
        scope.addLock(variable.name);
      }
      scope.io.outputAddDetails('Η συνθήκη της ΓΙΑ ' + variable.name + '<=' + v_final + ' είναι ΨΕΥΔΗΣ');

    } else if (v_initial >= v_final && v_step < 0) {
      while (scope.getSymbol(variable.name).val >= v_final) {
        scope.io.outputAddDetails('Η συνθήκη της ΓΙΑ ' + variable.name + '>=' + v_final + ' είναι ΑΛΗΘΗΣ');
    
        body.resolve(scope);
        
        scope.removeLock(variable.name);
        scope.setSymbol(
          this.variable.name,
          new Atom.MNumber(scope.getSymbol(variable.name).val + v_step)
        );
        scope.addLock(variable.name);
      }
      scope.io.outputAddDetails('Η συνθήκη της ΓΙΑ ' + variable.name + '>=' + v_final + ' είναι ΨΕΥΔΗΣ');

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
    var sym = this.symbol;

    if (sym instanceof MSymbolTableAssign)
        sym = this.symbol.resolve(scope);

    var valResolved = this.val.resolve(scope);
    
    scope.setSymbol(sym.name, valResolved);
  }
}

class Stmt_Write {
  constructor(args) {
    this.args = args;
  }
  resolve(scope) {

    var output = [];

    this.args.forEach(function (argParam) {

      if (argParam instanceof MSymbolTableFetch)
          argParam = argParam.resolve(scope);

      if (argParam.resolve(scope) == null)
        throw new GE.GError('Το αναγνωριστικό ' + argParam.name + ' δεν έχει αρχικοποιηθεί.');
  
      var arg = argParam.resolve(scope);

      if (arg instanceof Atom.MBoolean) {
        output.push(arg.getValue() ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ");
        //console.log("OUT1: ", arg.getValue() ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ");
      } else {
        output.push(arg.getValue());
        //console.log("OUT2: ", arg.getValue());
      }
    });

    scope.io.outputAdd( output.join(" ") );
    scope.io.outputAddDetails( 'Δείξε στην οθόνη: ' + output.join(" ") );
  }
}

class Stmt_Read {
  constructor(params) {
    this.params = params;
  }
  resolve(scope) {

    this.params.forEach(function (param) {

      // Check if is a table cell fetch real symbol
      if (param instanceof MSymbolTableAssign)
          param = param.resolve(scope);

      //var data = IOKeyboard.getSingleInputData();
      var data = scope.io.inputFetchValueFromBuffer();

      scope.io.outputAddDetails( 'Εισαγωγή τιμής από το πληκτρολόγιο: ' + data );

      if      (typeof(data) == 'string')  var sym = new Atom.MString(data);
      else if (typeof(data) == 'number')  var sym = new Atom.MNumber(data);
      else 
        throw new GE.GError('Critical: Unknown input value type: ' + data);
            
      scope.setSymbol(param.name, sym);
    });

  }
}

class DefDeclarations {
  constructor(consts, vars) {
    this.consts = consts;
    this.vars = vars;
  }
  resolve(scope) {
    if (this.consts[0]) this.consts[0].forEach( (e) => e.resolve(scope));
    if (this.vars[0])   this.vars[0].forEach(   (e) => e.resolve(scope));
  }
}

class DefConstant {
  constructor(sym, val) {
    this.sym = sym;
    this.val = val;
  }
  resolve(scope) {

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
      throw new GE.GError('Critical: Unknown constant type');

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
          throw new GE.GError('Critical: Unknown variable type');
    
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
            throw new GE.GError('Critical: Unknown variable type');
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
    } else
        throw new GE.GError('Critical: Unsupported table dimensions');

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
      throw new GE.GError('Critical: Cannot detect variable type');
  
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
    scope.io.outputAddDetails('Κλήση της Συνάρτησης ' + this.fun.name);

    if (!scope.hasSymbol(this.fun.name))
      throw new GE.GError('Η συνάρτηση ' + this.fun.name + ' δεν βρέθηκε.');

    var argsResolved = this.args.map((arg) => arg.resolve(scope));

    var sendData = [];
    sendData[0] = argsResolved;
   // sendData[1] = io;
    sendData[1] = scope;
 
    var fun = scope.getSymbol(this.fun.name);

    var valReturned = fun.apply(this, sendData);

    scope.io.outputAddDetails('Επιστροφή από την συνάρτηση ' + this.fun.name + ' με τιμή επιστροφής ' + valReturned.val);
  
    return valReturned;
  }
}


class CallSubProcedure {
  constructor(fun, args) {
    this.fun = fun;
    this.args = args;
  }
  resolve(scope) {
    scope.io.outputAddDetails('Κλήση της Διαδικασίας ' + this.fun.name);

    if (!scope.hasSymbol(this.fun.name))
      throw new GE.GError('Η διαδικασία ' + this.fun.name + 'δεν βρέθηκε.');

    var argsResolved = this.args.map((arg) => arg.resolve(scope));

    var fun = scope.getSymbol(this.fun.name);

    var sendData = [];
    sendData[0] = argsResolved;
    sendData[1] = scope;
 
    var recvData = fun.apply(null, sendData);

    scope.io.outputAddDetails('Επιστροφή από την διαδικασία ' + this.fun.name);
   
    var procScope  = recvData[0];
    var procParams = recvData[1];

    this.args.map(function (arg, i) {
      if (argsResolved[i] instanceof STR.STRTableName) {
        //console.log('detected table arg is : ', arg);

        // Return symbol from arg cell name
        var tblDimensions = scope.getSymbol(arg.name).getSize().length;

        if (tblDimensions == 1) {
          var tblsize1 = scope.getSymbol(arg.name).getSize()[0];
          for (var j = 1; j <= tblsize1; ++j) { 
            scope.setSymbol(arg.name + "[" + j + "]", procScope.getSymbol(procParams[i].name + "[" + j + "]"));
          }
        } else if (tblDimensions == 2) {
            var tblsize1 = scope.getSymbol(arg.name).getSize()[0];
            var tblsize2 = scope.getSymbol(arg.name).getSize()[1];
            for (var j = 1; j <= tblsize1; ++j) {
              for (var l = 1; l <= tblsize2; ++l) {
              scope.setSymbol(arg.name + "[" + j + "][" + l + "]", procScope.getSymbol(procParams[i].name + "[" + j + "][" + l + "]"));
            }
          }
        }


      }
      else if (arg instanceof MSymbolTableFetch ) {
        //console.log('detected table CELL arg is : ', arg);
        scope.setSymbol(arg.cellName, procScope.getSymbol(procParams[i].name));

      }
      else if  (arg instanceof MSymbol) {
        scope.setSymbol(arg.name, procScope.getSymbol(procParams[i].name));
      }

    });

  }
}

class SubFunction {
  constructor(name, params, funType, declarations, body) {
    this.name = name;
    this.params = params;
    this.funType = funType;
    this.declarations = declarations;
    this.body = body;
  }

  resolve(scope) {
    var name = this.name.name;
    var params = this.params;
    var funType = this.funType;
    var declarations = this.declarations;
    var body = this.body;

    scope.addSymbol(name, new STR.STRUserFunction(function (...arrargs) {
      var args  = arrargs[0];
      var parentScope = arrargs[1];
     
     if (args.length != params.length)
        throw new GE.GError(
          'Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης.'
        );

      var scope2 = scope.makeSubScope();

      var ftype = null;

      switch (funType) {
        case 'ΑΚΕΡΑΙΑ':    ftype = new STR.STRFuncNameInt( null ); break;
        case 'ΠΡΑΓΜΑΤΙΚΗ': ftype = new STR.STRFuncNameFloat( null ); break;
        case 'ΧΑΡΑΚΤΗΡΑΣ': ftype = new STR.STRFuncNameString( null ); break;
        case 'ΛΟΓΙΚΗ':     ftype = new STR.STRFuncNameBoolean( null ); break;
        default:
          throw new GE.GError('Critical: Cannot detect function return value type');

      }
    
      // Add function name as a variable
      scope2.addSymbolFuncName(name, ftype);

      declarations.resolve(scope2);

      params.forEach(function (param, i) {
        if (!scope2.hasSymbol(param.name))
          throw new GE.GError(
            'Η παράμετρος ' + param.name + 'δεν έχει δηλωθεί στο τμήμα δηλώσεων.'
          );
        
        if (!(args[i] instanceof STR.STRTableName))
          scope2.setSymbol(param.name, args[i]);
        else {

          if (scope2.getSymbol(param.name).constructor.name != args[i].constructor.name)
            throw new GE.GError('Οι πίνακες έχουν διαφορετικό τύπο.');
          
          if (!scope2.getSymbol(param.name).arraySizeEquals(args[i]))
            throw new GE.GError('Οι πίνακες έχουν διαφορετικό μέγεθος.');

          var tblDimensions = scope2.getSymbol(param.name).getSize().length;

          if (tblDimensions == 1) {
            var tblsize1 = args[i].getSize()[0];
            for (var k = 1; k <= tblsize1; ++k) {
              scope2.setSymbol(param.name + "[" + k + "]", parentScope.getSymbol(args[i].tblname + "[" + k + "]"));
            }
          } else if (tblDimensions == 2) {
              var tblsize1 = argsResolved[0];
              var tblsize2 = argsResolved[1];
              for (var k = 1; k <= tblsize1; ++k) {
                for (var l = 1; l <= tblsize2; ++l) {
                  scope2.setSymbol(param.name + "[" + k + "][" + l + "]", parentScope.getSymbol(args[i].tblname + "[" + k + "][" + l + "]"));
                }
            }
          }

        }
      });


      body.resolve(scope2);

      if (!scope2.getSymbol(name))
        throw new GE.GError('Η συνάρτηση δεν επέστρεψε τιμή με το όνομά της.');

      return scope2.getSymbol(name);
    }));
  }
}

class SubProcedure {
  constructor(name, params, declarations, body) {
    this.name = name;
    this.params = params;
    this.declarations = declarations;
    this.body = body;
  }

  resolve(scope) {
    var name = this.name.name;
    var params = this.params;
    var declarations = this.declarations;
    var body = this.body;

    scope.addSymbol(name, new STR.STRUserProcedure(function (...arrargs) {
      var args  = arrargs[0];
      var parentScope = arrargs[1];

      if (args.length != params.length)
        throw new GE.GError(
          'Λάθος αριθμός παραμέτρων κατά την κλήση της διαδικασίας.'
        );
 
      var scope2 = scope.makeSubScope();

      // Declare constants and variables
      declarations.resolve(scope2);

      // Sent values to procedure
      params.forEach(function (param, i) {
        if (!scope2.hasSymbol(param.name))
          throw new GE.GError(
            'Η παράμετρος ' + param.name + ' δεν έχει δηλωθεί στο τμήμα δηλώσεων.'
          );
        
        if (!(args[i] instanceof STR.STRTableName))
          scope2.setSymbol(param.name, args[i]);
        else {

          if (scope2.getSymbol(param.name).constructor.name != args[i].constructor.name)
            throw new GE.GError('Οι πίνακες έχουν διαφορετικό τύπο.');
          
          if (!scope2.getSymbol(param.name).arraySizeEquals(args[i]))
            throw new GE.GError('Οι πίνακες έχουν διαφορετικό μέγεθος.');

          var tblDimensions = scope2.getSymbol(param.name).getSize().length;

          if (tblDimensions == 1) {
            var tblsize1 = args[i].getSize()[0];
            for (var k = 1; k <= tblsize1; ++k) {
              scope2.setSymbol(param.name + "[" + k + "]", parentScope.getSymbol(args[i].tblname + "[" + k + "]"));
            }
          } else if (tblDimensions == 2) {
              var tblsize1 = argsResolved[0];
              var tblsize2 = argsResolved[1];
              for (var k = 1; k <= tblsize1; ++k) {
                for (var l = 1; l <= tblsize2; ++l) {
                  scope2.setSymbol(param.name + "[" + k + "][" + l + "]", parentScope.getSymbol(args[i].tblname + "[" + k + "][" + l + "]"));
                }
            }
          }

        }
      });

      body.resolve(scope2);

      var procExecArr = [scope2, params];

      return procExecArr;
    }));
  }
}

class Program {
  constructor(name, declarations, body) {
    this.name = name;
    this.declarations = declarations;
    this.body = body;
  }

  resolve(scope) {

    var newScope = scope.makeSubScope();

    newScope.addSymbol(this.name.name, new STR.STRReservedName(null));

    this.declarations.resolve(newScope);

    this.body.resolve(newScope);
  }
}

class Application {
  constructor(keyboardData, mainProg, subPrograms) {
    this.mainProg = mainProg;
    this.subPrograms = subPrograms;
    this.keyboardData = keyboardData;
  }
  resolve(scope) {
    
    if (scope.io.inputIsEmptyBuffer() && this.keyboardData.length) {
      //console.log('>> Setting keyboard buffer from inline source code');
      this.keyboardData.forEach((e) => e.addKeyboardInputData(scope));
    }


    if (this.subPrograms.length)
      this.subPrograms.forEach((e) => e.resolve(scope));

    this.mainProg.resolve(scope);
  }
}

class KeyboardDataFromSource {
  constructor(args) {
    this.args = args;
  }
 
  addKeyboardInputData(scope) {
    var argsResolved = this.args.map((arg) => arg.resolve(scope));
    argsResolved.forEach(function (e) { 
      scope.io.inputAddToBuffer(e.val); 
    }); 
  }
}


module.exports = {

  MSymbol: MSymbol,

  MSymbolTableAssign: MSymbolTableAssign,
  MSymbolTableFetch: MSymbolTableFetch,

  Stmt_Block: Stmt_Block,
  
  Stmt_Assignment: Stmt_Assignment,
  
  Stmt_Write: Stmt_Write,
  Stmt_Read: Stmt_Read,

  Stmt_IfCond: Stmt_IfCond,

  Stmt_WhileLoop: Stmt_WhileLoop,
  Stmt_Do_WhileLoop: Stmt_Do_WhileLoop,
  Stmt_ForLoop: Stmt_ForLoop,

  Application: Application,
  Program: Program,

  DefDeclarations: DefDeclarations,

  DefConstant: DefConstant,
  DefVariables: DefVariables,

  CallSubFunction: CallSubFunction,
  CallSubProcedure: CallSubProcedure,

  SubFunction: SubFunction,
  SubProcedure: SubProcedure,

  KeyboardDataFromSource: KeyboardDataFromSource,
};
