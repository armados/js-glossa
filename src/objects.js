"use strict";

const Atom = require("./atom");
const GE = require("./gclasses");
const STR = require("./storage");


function sleepme(time) {
  var stop = new Date().getTime();
  while (new Date().getTime() < stop + time) {}
}

// ========================

class Stmt_Block {
  constructor(block) {
    this.statements = block;
  }

  resolve(scope) {
    this.statements.forEach(function (statement) {
      //sleepme(90); //FIXME:
      //console.log(scope.io.outputData[scope.io.outputData.length -1 ]);
      //console.log('=================================');
      statement.resolve(scope);
    });
  }
}

// ===================================

class Stmt_Assignment {
  constructor(sym, val, cmdStrA, cmdStrB, cmdLineNo) {
    this.symbol = sym;
    this.val = val;
    this.cmdStrA = cmdStrA;
    this.cmdStrB = cmdStrB;
    this.cmdLineNo = cmdLineNo;
  }
  resolve(scope) {
    scope.cmdLineNo = this.cmdLineNo; //FIXME:

    var sym = this.symbol;

    if (sym instanceof Atom.MSymbolTableCell) sym = sym.eval(scope);

    var valResolved = this.val.resolve(scope);

    scope.io.outputAddDetails(
      this.cmdStrA + " <- " + this.cmdStrB,
      this.cmdLineNo
    );

    scope.setSymbol(sym.name, valResolved);

    scope.incrAssignCounter();
  }
}

class Stmt_Write {
  constructor(args, cmdLineNo) {
    this.args = args;
    this.cmdLineNo = cmdLineNo;
  }
  resolve(scope) {
    scope.cmdLineNo = this.cmdLineNo; //FIXME:

    var output = [];

    for (var i = 0, len = this.args.length; i < len; i++) {
      var argParam = this.args[i];

      if (argParam instanceof Atom.MSymbolTableCell)
        argParam = argParam.eval(scope);

      var arg = argParam.resolve(scope);

      if (arg == null)
        throw new GE.GError(
          "Το αναγνωριστικό " + argParam.name + " δεν έχει αρχικοποιηθεί.",
          this.cmdLineNo
        );

      var out = arg.getValue();

      if (arg instanceof Atom.MBoolean)
        out = arg.getValue() ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ";

      output.push(out);
    }

    //console.log ( output.join(' ') );

    scope.io.outputAdd(output.join(' '));
    scope.io.outputAddDetails(
      "Εμφάνισε στην οθόνη: " + output.join(' '),
      this.cmdLineNo
    );
  }
}

class Stmt_Read {
  constructor(args, cmdLineNo) {
    this.args = args;
    this.cmdLineNo = cmdLineNo;
  }
  resolve(scope) {
    scope.cmdLineNo = this.cmdLineNo; //FIXME:

    scope.io.outputAddDetails("Διάβασε από το πληκτρολόγιο", this.cmdLineNo);

    var output = [];

    for (var i = 0, len = this.args.length; i < len; i++) {
      var arg = this.args[i];

      if (arg instanceof Atom.MSymbolTableCell) arg = arg.eval(scope);

      var data = scope.io.inputFetchValueFromBuffer();

/*
      if (data == null) {

        if (typeof prompt === 'function') {
          const prompt = require('prompt-sync')();

        data = prompt();
        if  (!isNaN(parseFloat(data))) 
         data= Number(data);
         if (scope.getSymbolObject(arg.name) instanceof STR.STRString) { data= String(data);}
        }


      }
*/      
      if (data == null)
        throw new GE.GError(
          "Τα δεδομένα εισόδου δεν επαρκούν για την εκτέλεση του προγράμματος.",
          this.cmdLineNo
        );

      scope.io.outputAddDetails(
        "Εισαγωγή από το πληκτρολόγιο της τιμής " +
          data +
          " στο αναγνωριστικό " +
          arg.name,
        this.cmdLineNo
      );

      output.push(data);

      if (typeof data == "string") var sym = new Atom.MString(data);
      else if (typeof data == "number") var sym = new Atom.MNumber(data);
      else throw new GE.GError("Critical: Unknown input value type: " + data);

      scope.setSymbol(arg.name, sym);
    }

    //scope.io.outputAddDetails('Εισαγωγή από το πληκτρολόγιο: ' + output.join(" "), this.cmdLineNo);
  }
}

class Stmt_IfCond {
  constructor(arrCond, arrCondStr, arrLineNo, arrBody, elseBody, elseBodyLine) {
    this.arrCond = arrCond;
    this.arrCondStr = arrCondStr;
    this.arrLineNo = arrLineNo;
    this.arrBody = arrBody;
    this.elseBody = elseBody;
    this.elseBodyLine = elseBodyLine;
  }

  resolve(scope) {
    scope.cmdLineNo = this.arrLineNo[0]; //FIXME:

    var arrCond = this.arrCond;
    var arrCondStr = this.arrCondStr;
    var arrLineNo = this.arrLineNo;
    var arrBody = this.arrBody;
    var elseBody = this.elseBody;
    var elseBodyLine = this.elseBodyLine;

    for (var i = 0; i < arrCond.length; ++i) {
      var condResult = arrCond[i].resolve(scope);

      if (!(condResult instanceof Atom.MBoolean))
        throw new GE.GError(
          "Η συνθήκη της ΑΝ δεν αποτελεί λογική έκφραση.",
          arrLineNo[i]
        );

      scope.io.outputAddDetails(
        "Η συνθήκη της ΑΝ " +
          arrCondStr[i] +
          " έχει τιμή " +
          (condResult.val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ"),
        arrLineNo[i]
      );

      scope.incrLogicalCounter();

      if (condResult.val == true) return arrBody[i].resolve(scope);
    }

    if (elseBody != null) {
      scope.io.outputAddDetails(
        "Εκτέλεση του τμήματος εντολών της ΑΛΛΙΩΣ",
        elseBodyLine
      );
      return elseBody.resolve(scope);
    }
  }
}

class Stmt_Select {
  constructor(
    expr,
    arrCond,
    arrCondStr,
    arrLineNo,
    arrBody,
    elseBody,
    elseBodyLine,
    cmdLineNo
  ) {
    this.expr = expr;
    this.arrCond = arrCond;
    this.arrCondStr = arrCondStr;
    this.arrLineNo = arrLineNo;
    this.arrBody = arrBody;
    this.elseBody = elseBody;
    this.elseBodyLine = elseBodyLine;
    this.cmdLineNo = cmdLineNo;
  }

  resolve(scope) {
    scope.cmdLineNo = this.cmdLineNo;

    var expr = this.expr;
    var arrCond = this.arrCond;
    var arrCondStr = this.arrCondStr;
    var arrLineNo = this.arrLineNo;
    var arrBody = this.arrBody;
    var elseBody = this.elseBody;
    var elseBodyLine = this.elseBodyLine;

    //console.log('select expression: ', this.expr);
    //console.log('select expression value: ', this.expr.resolve(scope));

    //console.log(arrCond);
    var exprResult = expr.resolve(scope);

    if (exprResult instanceof STR.STRTableName)
      throw new GE.GError(
        "Στην εντολή ΕΠΙΛΕΞΕ επιτρέπονται εκφράσεις όλων των τύπων δεδομένων αλλά όχι πίνακες.",
        this.cmdLineNo
      );

    for (var i = 0; i < arrCond.length; ++i) {
      for (var j = 0; j < arrCond[i].length; ++j) {
        var condResult = arrCond[i][j].resolve(scope);
        //console.log("select PERIPTOSI resolved value: " + condResult);
        //console.log(condResult);

        if (!(condResult instanceof Atom.MBoolean))
          throw new GE.GError(
            "Η συνθήκη της ΕΠΙΛΕΞΕ δεν αποτελεί λογική έκφραση.",
            arrLineNo[i]
          );

        scope.io.outputAddDetails(
          "Η συνθήκη της ΕΠΙΛΕΞΕ " +
            arrCondStr[i] +
            " έχει τιμή " +
            (condResult.val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ"),
          arrLineNo[i]
        );

        scope.incrLogicalCounter();

        if (condResult.val == true) return arrBody[i].resolve(scope);
      }
    }

    if (elseBody != null) {
      scope.io.outputAddDetails(
        "Εκτέλεση του τμήματος εντολών της ΑΛΛΙΩΣ",
        elseBodyLine
      );
      return elseBody.resolve(scope);
    }
  }
}

class Stmt_WhileLoop {
  constructor(cond, condstr, body, cmdLineNo) {
    this.cond = cond;
    this.condstr = condstr;
    this.body = body;
    this.cmdLineNo = cmdLineNo;
  }
  resolve(scope) {
    scope.cmdLineNo = this.cmdLineNo; //FIXME:

    while (true) {
      var condResult = this.cond.resolve(scope);

      if (!(condResult instanceof Atom.MBoolean))
        throw new GE.GError(
          "Η συνθήκη της ΟΣΟ δεν αποτελεί λογική έκφραση.",
          this.cmdLineNo
        );

      scope.io.outputAddDetails(
        "Η συνθήκη της ΟΣΟ " +
          this.condstr +
          " έχει τιμή " +
          (condResult.val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ"),
        this.cmdLineNo
      );

      if (!condResult.val) break;

      scope.incrLogicalCounter();

      this.body.resolve(scope);
    }
  }
}

class Stmt_Do_WhileLoop {
  constructor(cond, condstr, body, cmdLineNo) {
    this.cond = cond;
    this.condstr = condstr;
    this.body = body;
    this.cmdLineNo = cmdLineNo;
  }
  resolve(scope) {
    scope.cmdLineNo = this.cmdLineNo; //FIXME:

    do {
      this.body.resolve(scope);

      var condResult = this.cond.resolve(scope);

      if (!(condResult instanceof Atom.MBoolean))
        throw new GE.GError(
          "Η συνθήκη της ΜΕΧΡΙΣ_ΟΤΟΥ δεν αποτελεί λογική έκφραση.",
          this.cmdLineNo
        );

      scope.io.outputAddDetails(
        "Η συνθήκη της ΜΕΧΡΙΣ_ΟΤΟΥ " +
          this.condstr +
          " έχει τιμή " +
          (condResult.val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ"),
        this.cmdLineNo
      );

      scope.incrLogicalCounter();

      if (condResult.val) break;
    } while (true);
  }
}

class Stmt_ForLoop {
  constructor(variable, initval, finalval, stepval, body, cmdLineNo) {
    this.variable = variable;
    this.initval = initval;
    this.finalval = finalval;
    this.stepval = stepval;
    this.body = body;
    this.cmdLineNo = cmdLineNo;
  }
  resolve(scope) {
    scope.cmdLineNo = this.cmdLineNo; //FIXME:

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
      throw new GE.GError(
        "Μη επιτρεπτή ενέργεια. Το βήμα της εντολή ΓΙΑ δεν μπορεί να λάβει την τιμή μηδέν.",
        this.cmdLineNo
      );

    var tmp = initval.resolve(scope);
    var v_initial = tmp.val;

    var tmp = finalval.resolve(scope);
    var v_final = tmp.val;

    if (variable instanceof Atom.MSymbolTableCell)
      //FIXME:
      variable = variable.eval(scope);

    scope.setSymbol(variable.name, new Atom.MNumber(v_initial));
    scope.addLock(variable.name);

    if (v_initial <= v_final && v_step > 0) {
      while (scope.getSymbol(variable.name).val <= v_final) {
        scope.io.outputAddDetails(
          "Η συνθήκη της ΓΙΑ " +
            variable.name +
            "<=" +
            v_final +
            " είναι ΑΛΗΘΗΣ",
          this.cmdLineNo
        );

        scope.incrLogicalCounter();

        body.resolve(scope);

        scope.removeLock(variable.name);

        scope.setSymbol(
          variable.name,
          new Atom.MNumber(scope.getSymbol(variable.name).val + v_step)
        );
        scope.addLock(variable.name);
      }
      scope.io.outputAddDetails(
        "Η συνθήκη της ΓΙΑ " + variable.name + "<=" + v_final + " είναι ΨΕΥΔΗΣ",
        this.cmdLineNo
      );
    } else if (v_initial >= v_final && v_step < 0) {
      while (scope.getSymbol(variable.name).val >= v_final) {
        scope.io.outputAddDetails(
          "Η συνθήκη της ΓΙΑ " +
            variable.name +
            ">=" +
            v_final +
            " είναι ΑΛΗΘΗΣ",
          this.cmdLineNo
        );

        scope.incrLogicalCounter();

        body.resolve(scope);

        scope.removeLock(variable.name);
        scope.setSymbol(
          variable.name,
          new Atom.MNumber(scope.getSymbol(variable.name).val + v_step)
        );
        scope.addLock(variable.name);
      }
      scope.io.outputAddDetails(
        "Η συνθήκη της ΓΙΑ " + variable.name + ">=" + v_final + " είναι ΨΕΥΔΗΣ",
        this.cmdLineNo
      );
    }

    scope.removeLock(variable.name);
  }
}

class CallSubFunction {
  constructor(fun, args, cmdLineNo) {
    this.fun = fun;
    this.args = args;
    this.cmdLineNo = cmdLineNo;
  }
  resolve(scope) {
    scope.cmdLineNo = this.cmdLineNo; //FIXME:

    scope.io.outputAddDetails(
      "Κλήση της Συνάρτησης " + this.fun.name,
      this.cmdLineNo
    );

    if (!scope.hasSymbol(this.fun.name))
      throw new GE.GError(
        "Η συνάρτηση " + this.fun.name + " δεν βρέθηκε.",
        this.cmdLineNo
      );

    var argsResolved = this.args.map((arg) => arg.resolve(scope));

    var sendData = [];
    sendData[0] = argsResolved;
    sendData[1] = scope;

    var fun = scope.getGlobalSymbol(this.fun.name);

    var valReturned = fun.apply(this, sendData);

    scope.io.outputAddDetails(
      "Επιστροφή από την συνάρτηση " +
        this.fun.name +
        " με τιμή επιστροφής " +
        valReturned.val,
      this.cmdLineNo
    );

    return valReturned;
  }
}

class CallSubProcedure {
  constructor(fun, args, cmdLineNo) {
    this.fun = fun;
    this.args = args;
    this.cmdLineNo = cmdLineNo;
  }
  resolve(scope) {
    scope.cmdLineNo = this.cmdLineNo; //FIXME:

    scope.io.outputAddDetails(
      "Κλήση της Διαδικασίας " + this.fun.name,
      this.cmdLineNo
    );

    if (!scope.hasSymbol(this.fun.name))
      throw new GE.GError(
        "Η διαδικασία " + this.fun.name + "δεν βρέθηκε.",
        this.cmdLineNo
      );

    var argsResolved = this.args.map((arg) => arg.resolve(scope));

    var fun = scope.getGlobalSymbol(this.fun.name);

    var sendData = [];
    sendData[0] = argsResolved;
    sendData[1] = scope;

    var recvData = fun.apply(null, sendData);

    scope.io.outputAddDetails(
      "Επιστροφή από την διαδικασία " + this.fun.name,
      this.cmdLineNo
    );

    var procScope = recvData[0];
    var procParams = recvData[1];

    this.args.map(function (arg, i) {
      if (argsResolved[i] instanceof STR.STRTableName) {
        //console.log('detected table arg is : ', arg);

        // Return symbol from arg cell name
        var tblDimensions = scope.getSymbol(arg.name).getSize().length;

        if (tblDimensions == 1) {
          var tblsize1 = scope.getSymbol(arg.name).getSize()[0];
          for (var j = 1; j <= tblsize1; ++j) {
            scope.setSymbol(
              arg.name + "[" + j + "]",
              procScope.getSymbol(procParams[i].name + "[" + j + "]")
            );
          }
        } else if (tblDimensions == 2) {
          var tblsize1 = scope.getSymbol(arg.name).getSize()[0];
          var tblsize2 = scope.getSymbol(arg.name).getSize()[1];
          for (var j = 1; j <= tblsize1; ++j) {
            for (var l = 1; l <= tblsize2; ++l) {
              scope.setSymbol(
                arg.name + "[" + j + "," + l + "]",
                procScope.getSymbol(
                  procParams[i].name + "[" + j + "," + l + "]"
                )
              );
            }
          }
        }
      } else if (arg instanceof Atom.MSymbolTableCell) {
        arg = arg.eval(scope);
        if (
          scope.getSymbol(arg.name) != procScope.getSymbol(procParams[i].name)
        )
          scope.setSymbol(arg.name, procScope.getSymbol(procParams[i].name));
      } else if (arg instanceof Atom.MSymbol) {
        if (
          scope.getSymbol(arg.name) != procScope.getSymbol(procParams[i].name)
        )
          scope.setSymbol(arg.name, procScope.getSymbol(procParams[i].name));
      }
    });
  }
}

class SubFunction {
  constructor(name, params, funType, declarations, body, cmdLineNo) {
    this.name = name;
    this.params = params;
    this.funType = funType;
    this.declarations = declarations;
    this.body = body;
    this.cmdLineNo = cmdLineNo;
  }

  resolve(scope) {
    scope.cmdLineNo = this.cmdLineNo; //FIXME:

    var name = this.name.name;
    var params = this.params;
    var funType = this.funType;
    var declarations = this.declarations;
    var body = this.body;

    scope.addSymbol(
      name,
      new STR.STRUserFunction(function (...arrargs) {
        var args = arrargs[0];
        var parentScope = arrargs[1];

        if (args.length != params.length)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης."
          );

        var scope2 = scope.makeSubScope();

        var ftype = null;

        switch (funType) {
          case "ΑΚΕΡΑΙΑ":
            ftype = new STR.STRFuncNameInt(null);
            break;
          case "ΠΡΑΓΜΑΤΙΚΗ":
            ftype = new STR.STRFuncNameFloat(null);
            break;
          case "ΧΑΡΑΚΤΗΡΑΣ":
            ftype = new STR.STRFuncNameString(null);
            break;
          case "ΛΟΓΙΚΗ":
            ftype = new STR.STRFuncNameBoolean(null);
            break;
          default:
            throw new GE.GError(
              "Critical: Cannot detect function return value type"
            );
        }

        // Add function name as variable
        scope2.addSymbolFuncName(name, ftype);

        declarations.resolve(scope2);

        params.forEach(function (param, i) {
          if (!scope2.hasSymbol(param.name))
            throw new GE.GError(
              "Η παράμετρος " +
                param.name +
                "δεν έχει δηλωθεί στο τμήμα δηλώσεων."
            );

          if (!(args[i] instanceof STR.STRTableName))
            scope2.setSymbol(param.name, args[i]);
          else {
            if (
              scope2.getSymbol(param.name).constructor.name !=
              args[i].constructor.name
            )
              throw new GE.GError("Οι πίνακες έχουν διαφορετικό τύπο.");

            if (!scope2.getSymbol(param.name).arraySizeEquals(args[i]))
              throw new GE.GError("Οι πίνακες έχουν διαφορετικό μέγεθος.");

            var tblDimensions = scope2.getSymbol(param.name).getSize().length;

            if (tblDimensions == 1) {
              var tblsize1 = args[i].getSize()[0];
              for (var k = 1; k <= tblsize1; ++k) {
                scope2.setSymbol(
                  param.name + "[" + k + "]",
                  parentScope.getSymbol(args[i].tblname + "[" + k + "]")
                );
              }
            } else if (tblDimensions == 2) {
              var tblsize1 = argsResolved[0];
              var tblsize2 = argsResolved[1];
              for (var k = 1; k <= tblsize1; ++k) {
                for (var l = 1; l <= tblsize2; ++l) {
                  scope2.setSymbol(
                    param.name + "[" + k + "," + l + "]",
                    parentScope.getSymbol(
                      args[i].tblname + "[" + k + "," + l + "]"
                    )
                  );
                }
              }
            }
          }
        });

        body.resolve(scope2);

        if (!scope2.getSymbol(name))
          throw new GE.GError(
            "Η συνάρτηση δεν επέστρεψε τιμή με το όνομά της."
          );

        return scope2.getSymbol(name);
      })
    );
  }
}

class SubProcedure {
  constructor(name, params, declarations, body, cmdLineNo) {
    this.name = name;
    this.params = params;
    this.declarations = declarations;
    this.body = body;
    this.cmdLineNo = cmdLineNo;
  }

  resolve(scope) {
    scope.cmdLineNo = this.cmdLineNo; //FIXME:

    var name = this.name.name;
    var params = this.params;
    var declarations = this.declarations;
    var body = this.body;

    scope.addSymbol(
      name,
      new STR.STRUserProcedure(function (...arrargs) {
        var args = arrargs[0];
        var parentScope = arrargs[1];

        if (args.length != params.length)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της διαδικασίας."
          );

        var scope2 = scope.makeSubScope();

        // Declare constants and variables
        declarations.resolve(scope2);

        // Sent values to procedure
        params.forEach(function (param, i) {
          if (!scope2.hasSymbol(param.name))
            throw new GE.GError(
              "Η παράμετρος " +
                param.name +
                " δεν έχει δηλωθεί στο τμήμα δηλώσεων."
            );

          if (!(args[i] instanceof STR.STRTableName))
            scope2.setSymbol(param.name, args[i]);
          else {
            if (
              scope2.getSymbol(param.name).constructor.name !=
              args[i].constructor.name
            )
              throw new GE.GError("Οι πίνακες έχουν διαφορετικό τύπο.");

            if (!scope2.getSymbol(param.name).arraySizeEquals(args[i]))
              throw new GE.GError("Οι πίνακες έχουν διαφορετικό μέγεθος.");

            var tblDimensions = scope2.getSymbol(param.name).getSize().length;

            if (tblDimensions == 1) {
              var tblsize1 = args[i].getSize()[0];
              for (var k = 1; k <= tblsize1; ++k) {
                scope2.setSymbol(
                  param.name + "[" + k + "]",
                  parentScope.getSymbol(args[i].tblname + "[" + k + "]")
                );
              }
            } else if (tblDimensions == 2) {
              var tblsize1 = argsResolved[0];
              var tblsize2 = argsResolved[1];
              for (var k = 1; k <= tblsize1; ++k) {
                for (var l = 1; l <= tblsize2; ++l) {
                  scope2.setSymbol(
                    param.name + "[" + k + "][" + l + "]",
                    parentScope.getSymbol(
                      args[i].tblname + "[" + k + "][" + l + "]"
                    )
                  );
                }
              }
            }
          }
        });

        body.resolve(scope2);

        var procExecArr = [scope2, params];

        return procExecArr;
      })
    );
  }
}

class DefDeclarations {
  constructor(consts, vars) {
    this.consts = consts;
    this.vars = vars;
  }
  resolve(scope) {
    if (this.consts[0]) this.consts[0].forEach((e) => e.resolve(scope));
    if (this.vars[0]) this.vars[0].forEach((e) => e.resolve(scope));
  }
}

class DefConstant {
  constructor(sym, val, cmdLineNo) {
    this.sym = sym;
    this.val = val;
    this.cmdLineNo = cmdLineNo;
  }
  resolve(scope) {
    scope.cmdLineNo = this.cmdLineNo; //FIXME:

    var obj = this.val.resolve(scope);

    if (Number(obj.val) === obj.val && obj.val % 1 === 0)
      var newObj = new STR.STRInt(obj);
    else if (Number(obj.val) === obj.val && obj.val % 1 !== 0)
      var newObj = new STR.STRFloat(obj);
    else if (typeof obj.val == "string") var newObj = new STR.STRString(obj);
    else if (typeof obj.val == "boolean") var newObj = new STR.STRBoolean(obj);
    else throw new GE.GError("Critical: Unknown constant type");

    scope.addSymbol(this.sym.name, newObj);
    scope.addLock(this.sym.name);
  }
}

class DefVariables {
  constructor(varType, sym, cmdLineNo) {
    this.varType = varType;
    this.sym = sym;
    this.cmdLineNo = cmdLineNo;
  }
  resolve(scope) {
    scope.cmdLineNo = this.cmdLineNo; //FIXME:

    var varType = this.varType;
    //console.log('======> DefVariables: : ', varType);

    this.sym.forEach(function (e) {
      //console.log('======> DefVariables: Create variable symbol name: ', e.name, varType, e);

      if (e instanceof Atom.MSymbolTableCell) {
        //console.log('======> DefVariables: Create variable TABLE symbol name: ', e.name, varType);

        var argsResolved = e.args.map(function (arg) {
          return arg.resolve(scope).val;
        });

        if (varType == "ΑΚΕΡΑΙΕΣ")
          var ctype = new STR.STRTableNameInt(e.name, argsResolved);
        else if (varType == "ΠΡΑΓΜΑΤΙΚΕΣ")
          var ctype = new STR.STRTableNameFloat(e.name, argsResolved);
        else if (varType == "ΧΑΡΑΚΤΗΡΕΣ")
          var ctype = new STR.STRTableNameString(e.name, argsResolved);
        else if (varType == "ΛΟΓΙΚΕΣ")
          var ctype = new STR.STRTableNameBoolean(e.name, argsResolved);
        else throw new GE.GError("Critical: Unknown variable type");

        // Add to local STR symbol for table name
        scope.addSymbol(e.name, ctype);

        function helperCreateCellFromType(varType) {
          if (varType == "ΑΚΕΡΑΙΕΣ") return new STR.STRInt(null);
          else if (varType == "ΠΡΑΓΜΑΤΙΚΕΣ") return new STR.STRFloat(null);
          else if (varType == "ΧΑΡΑΚΤΗΡΕΣ") return new STR.STRString(null);
          else if (varType == "ΛΟΓΙΚΕΣ") return new STR.STRBoolean(null);
          else throw new GE.GError("Critical: Unknown variable type");
        }

        // Initialize table cells
        var tblDimensions = argsResolved.length;

        /*
        var rrr1 = new Array(tblDimensions).fill(30);
        console.log (rrr1);

        var pl =0;
        var rrr2 = Array.apply(null, Array(tblDimensions)).map(function() {
          pl=pl+1;
          return pl;//helperCreateCellFromType(varType);
        });
        console.log (rrr2);
*/
        if (tblDimensions == 1) {
          var tblsize1 = argsResolved[0];
          for (var i = 1; i <= tblsize1; ++i) {
            //console.log('   Create table element : ', i);
            scope.addSymbol(
              e.name + "[" + i + "]",
              helperCreateCellFromType(varType)
            );
          }
        } else if (tblDimensions == 2) {
          var tblsize1 = argsResolved[0];
          var tblsize2 = argsResolved[1];
          for (var i = 1; i <= tblsize1; ++i) {
            for (var j = 1; j <= tblsize2; ++j) {
              //console.log('   Create table element : ', i, ' ', j);
              scope.addSymbol(
                e.name + "[" + i + "," + j + "]",
                helperCreateCellFromType(varType)
              );
            }
          }
        } else throw new GE.GError("Critical: Unsupported table dimensions");

        return true;
      }

      if (varType == "ΑΚΕΡΑΙΕΣ") var ctype = new STR.STRInt(null);
      else if (varType == "ΠΡΑΓΜΑΤΙΚΕΣ") var ctype = new STR.STRFloat(null);
      else if (varType == "ΧΑΡΑΚΤΗΡΕΣ") var ctype = new STR.STRString(null);
      else if (varType == "ΛΟΓΙΚΕΣ") var ctype = new STR.STRBoolean(null);
      else throw new GE.GError("Critical: Cannot detect variable type");

      return scope.addSymbol(e.name, ctype);
    });
  }
}

class Program {
  constructor(progname, declarations, body, cmdLineNo) {
    this.progname = progname;
    this.declarations = declarations;
    this.body = body;
    this.cmdLineNo = cmdLineNo;
  }

  resolve(scope) {
    scope.cmdLineNo = this.cmdLineNo; //FIXME:

    scope.addSymbol(this.progname.name, new STR.STRReservedName(null));

    this.declarations.resolve(scope);

    this.body.resolve(scope);

    //scope.printMemory();
  }
}

class InlineKeyboardInput {
  constructor(args) {
    this.args = args;
  }

  addKeyboardInputData(scope) {
    var argsResolved = this.args.map((arg) => arg.resolve(null));

    argsResolved.forEach((e) => scope.io.inputAddToBuffer(e.val));
  }
}

class Application {
  constructor(keyboardData, mainProg, subPrograms) {
    this.mainProg = mainProg;
    this.subPrograms = subPrograms;
    this.keyboardData = keyboardData;
  }
  resolve(scope) {
    if (scope.io.inputIsEmptyBuffer())
      this.keyboardData.forEach((e) => e.addKeyboardInputData(scope));

    if (this.subPrograms.length)
      this.subPrograms.forEach((e) => e.resolve(scope));

    this.mainProg.resolve(scope);
  }
}

module.exports = {
  Stmt_Block,

  Stmt_Assignment,

  Stmt_Write,
  Stmt_Read,

  Stmt_IfCond,
  Stmt_Select,

  Stmt_WhileLoop,
  Stmt_Do_WhileLoop,
  Stmt_ForLoop,

  Application,
  Program,

  DefDeclarations,

  DefConstant,
  DefVariables,

  CallSubFunction,
  CallSubProcedure,

  SubFunction,
  SubProcedure,

  InlineKeyboardInput,
};
