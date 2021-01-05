"use strict";

const Atom = require("./atom");
const GE = require("./gclasses");
const STR = require("./storage");
const HP = require("./helper");

class Stmt {}

// ========================

class Stmt_Block {
  constructor(block) {
    this.block = block;
  }
  async resolve(scope) {
    for (const stmt of this.block) {
      await stmt.resolve(scope);
    }
  }
}

class Stmt_Assignment extends Stmt {
  constructor(sym, val, cmdStrA, cmdStrB, cmdLineNo) {
    super();
    this.symbol = sym;
    this.val = val;
    this.cmdStrA = cmdStrA;
    this.cmdStrB = cmdStrB;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(scope) {
    await scope.setActiveLine(this.cmdLineNo);

    var sym = this.symbol;

    if (sym instanceof Atom.MSymbolTableCell) sym = sym.eval(scope);

    var valResolved = await this.val.resolve(scope);

    scope.io.outputAddDetails(
      this.cmdStrA + " <- " + this.cmdStrB,
      this.cmdLineNo
    );

    scope.setSymbol(sym.name, valResolved);

    scope.incrAssignCounter();
  }
}

class Stmt_Write extends Stmt {
  constructor(args, cmdLineNo) {
    super();
    this.args = args;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(scope) {
    await scope.setActiveLine(this.cmdLineNo);

    var output = [];

    for (var i = 0, len = this.args.length; i < len; i++) {
      var argParam = this.args[i];

      if (argParam instanceof Atom.MSymbolTableCell)
        argParam = argParam.eval(scope);

      var arg = await argParam.resolve(scope);

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

    scope.io.outputAdd(output.join(" "));
    scope.io.outputAddDetails(
      "Εμφάνισε στην οθόνη: " + output.join(" "),
      this.cmdLineNo
    );
  }
}

class Stmt_Read extends Stmt {
  constructor(args, cmdLineNo) {
    super();
    this.args = args;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(scope) {
    scope.io.outputAddDetails("Διάβασε από το πληκτρολόγιο", this.cmdLineNo);

    var output = [];

    for (var i = 0, len = this.args.length; i < len; i++) {
      await scope.setActiveLine(this.cmdLineNo);
      var arg = this.args[i];

      if (arg instanceof Atom.MSymbolTableCell) arg = arg.eval(scope);

      var data = scope.io.inputFetchValueFromBuffer();

      if (data == null) {
        if (typeof updateUI === "function") {
          data = updateUI("prompt", arg.name);
          if (!isNaN(parseFloat(data))) {
            data = Number(data);
          }
          if (scope.getSymbolObject(arg.name) instanceof STR.STRString) {
            data = String(data);
          }
        }
      }

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
      else if (typeof data == "boolean") var sym = new Atom.MBoolean(data);
      else throw new GE.GError("Critical: Unknown input value type: " + data);

      scope.setSymbol(arg.name, sym);
    }

    //scope.io.outputAddDetails('Εισαγωγή από το πληκτρολόγιο: ' + output.join(" "), this.cmdLineNo);
  }
}

class Stmt_IfCond extends Stmt {
  constructor(
    arrCond,
    arrCondStr,
    arrLineNo,
    arrBody,
    elseBody,
    elseBodyLine,
    telosAnLine
  ) {
    super();
    this.arrCond = arrCond;
    this.arrCondStr = arrCondStr;
    this.arrLineNo = arrLineNo;
    this.arrBody = arrBody;
    this.elseBody = elseBody;
    this.elseBodyLine = elseBodyLine;
    this.telosAnLine = telosAnLine;
  }

  async resolve(scope) {
    var arrCond = this.arrCond;
    var arrCondStr = this.arrCondStr;
    var arrLineNo = this.arrLineNo;
    var arrBody = this.arrBody;
    var elseBody = this.elseBody;
    var elseBodyLine = this.elseBodyLine;

    for (var i = 0; i < arrCond.length; ++i) {
      await scope.setActiveLine(this.arrLineNo[i]);

      var condResult = await arrCond[i].resolve(scope);

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

      if (condResult.val == true) {
        await arrBody[i].resolve(scope);
        await scope.setActiveLine(this.telosAnLine);
        return;
      }
    }

    if (elseBody != null) {
      await scope.setActiveLine(this.elseBodyLine);

      scope.io.outputAddDetails(
        "Εκτέλεση του τμήματος εντολών της ΑΛΛΙΩΣ",
        elseBodyLine
      );

      await elseBody.resolve(scope);
      await scope.setActiveLine(this.telosAnLine);
      return;
    }

    await scope.setActiveLine(this.telosAnLine);
  }
}

class Stmt_Select extends Stmt {
  constructor(
    expr,
    arrCond,
    arrCondStr,
    arrLineNo,
    arrBody,
    elseBody,
    cmdLineNo,
    elseBodyLine,
    cmdLineNoTelosEpilogwn
  ) {
    super();
    this.expr = expr;
    this.arrCond = arrCond;
    this.arrCondStr = arrCondStr;
    this.arrLineNo = arrLineNo;
    this.arrBody = arrBody;
    this.elseBody = elseBody;
    this.cmdLineNo = cmdLineNo;
    this.elseBodyLine = elseBodyLine;
    this.cmdLineNoTelosEpilogwn = cmdLineNoTelosEpilogwn;
  }

  async resolve(scope) {
    await scope.setActiveLine(this.cmdLineNo);

    var expr = this.expr;
    var arrCond = this.arrCond;
    var arrCondStr = this.arrCondStr;
    var arrLineNo = this.arrLineNo;
    var arrBody = this.arrBody;
    var elseBody = this.elseBody;
    var elseBodyLine = this.elseBodyLine;
    var cmdLineNoTelosEpilogwn = this.cmdLineNoTelosEpilogwn;

    //console.log('select expression: ', this.expr);
    //console.log('select expression value: ', this.expr.async resolve(scope));

    //console.log(arrCond);
    var exprResult = await expr.resolve(scope);

    if (exprResult instanceof STR.STRTableName)
      throw new GE.GError(
        "Στην εντολή ΕΠΙΛΕΞΕ επιτρέπονται εκφράσεις όλων των τύπων δεδομένων αλλά όχι πίνακες.",
        this.cmdLineNo
      );

    for (var i = 0; i < arrCond.length; ++i) {
      for (var j = 0; j < arrCond[i].length; ++j) {
        await scope.setActiveLine(arrLineNo[i]);

        var condResult = await arrCond[i][j].resolve(scope);
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

        if (condResult.val == true) {
          await arrBody[i].resolve(scope);
          await scope.setActiveLine(cmdLineNoTelosEpilogwn);
          return;
        }
      }
    }

    if (elseBody != null) {
      await scope.setActiveLine(elseBodyLine);

      scope.io.outputAddDetails(
        "Εκτέλεση του τμήματος εντολών της ΑΛΛΙΩΣ",
        elseBodyLine
      );

      await elseBody.resolve(scope);
      await scope.setActiveLine(cmdLineNoTelosEpilogwn);
      return;
    }
  }
}

class Stmt_WhileLoop extends Stmt {
  constructor(cond, condstr, body, cmdLineNoOso, cmdLineNoTelosEpanalhpshs) {
    super();
    this.cond = cond;
    this.condstr = condstr;
    this.body = body;
    this.cmdLineNoOso = cmdLineNoOso;
    this.cmdLineNoTelosEpanalhpshs = cmdLineNoTelosEpanalhpshs;
  }
  async resolve(scope) {
    while (true) {
      await scope.setActiveLine(this.cmdLineNoOso);

      var condResult = await this.cond.resolve(scope);

      if (!(condResult instanceof Atom.MBoolean))
        throw new GE.GError(
          "Η συνθήκη της ΟΣΟ δεν αποτελεί λογική έκφραση.",
          this.cmdLineNoOso
        );

      scope.io.outputAddDetails(
        "Η συνθήκη της ΟΣΟ " +
          this.condstr +
          " έχει τιμή " +
          (condResult.val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ"),
        this.cmdLineNoOso
      );

      if (!condResult.val) break;

      scope.incrLogicalCounter();

      await this.body.resolve(scope);

      await scope.setActiveLine(this.cmdLineNoTelosEpanalhpshs);
    }
  }
}

class Stmt_Do_WhileLoop extends Stmt {
  constructor(cond, condstr, body, cmdLineNoArxh, cmdLineNoMexrisOtou) {
    super();
    this.cond = cond;
    this.condstr = condstr;
    this.body = body;
    this.cmdLineNoArxh = cmdLineNoArxh;
    this.cmdLineNoMexrisOtou = cmdLineNoMexrisOtou;
  }
  async resolve(scope) {
    do {
      await scope.setActiveLine(this.cmdLineNoArxh);

      await this.body.resolve(scope);

      await scope.setActiveLine(this.cmdLineNoMexrisOtou);

      var condResult = await this.cond.resolve(scope);

      if (!(condResult instanceof Atom.MBoolean))
        throw new GE.GError(
          "Η συνθήκη της ΜΕΧΡΙΣ_ΟΤΟΥ δεν αποτελεί λογική έκφραση.",
          this.cmdLineNoMexrisOtou
        );

      scope.io.outputAddDetails(
        "Η συνθήκη της ΜΕΧΡΙΣ_ΟΤΟΥ " +
          this.condstr +
          " έχει τιμή " +
          (condResult.val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ"),
        this.cmdLineNoMexrisOtou
      );

      scope.incrLogicalCounter();

      if (condResult.val) break;
    } while (true);
  }
}

class Stmt_ForLoop extends Stmt {
  constructor(
    variable,
    initval,
    finalval,
    stepval,
    body,
    cmdLineNoGia,
    cmdLineNoTelosEpanalhpshs
  ) {
    super();
    this.variable = variable;
    this.initval = initval;
    this.finalval = finalval;
    this.stepval = stepval;
    this.body = body;
    this.cmdLineNoGia = cmdLineNoGia;
    this.cmdLineNoTelosEpanalhpshs = cmdLineNoTelosEpanalhpshs;
  }
  async resolve(scope) {
    await scope.setActiveLine(this.cmdLineNoGia);

    var variable = this.variable;
    var initval = this.initval;
    var finalval = this.finalval;
    var stepval = this.stepval;
    var body = this.body;

    var v_step = 1;

    if (stepval != "") {
      var tmp = await stepval[0].resolve(scope);
      v_step = tmp.val;
    }

    if (v_step == 0)
      throw new GE.GError(
        "Μη επιτρεπτή ενέργεια. Το βήμα της εντολή ΓΙΑ δεν μπορεί να λάβει την τιμή μηδέν.",
        this.cmdLineNoGia
      );

    var tmp = await initval.resolve(scope);
    var v_initial = tmp.val;

    var tmp = await finalval.resolve(scope);
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
          this.cmdLineNoGia
        );

        scope.incrLogicalCounter();

        await body.resolve(scope);

        await scope.setActiveLine(this.cmdLineNoTelosEpanalhpshs);

        await scope.setActiveLine(this.cmdLineNoGia);

        scope.removeLock(variable.name);

        scope.setSymbol(
          variable.name,
          new Atom.MNumber(scope.getSymbol(variable.name).val + v_step)
        );
        scope.addLock(variable.name);
      }

      scope.io.outputAddDetails(
        "Η συνθήκη της ΓΙΑ " + variable.name + "<=" + v_final + " είναι ΨΕΥΔΗΣ",
        this.cmdLineNoGia
      );
    } else if (v_initial >= v_final && v_step < 0) {
      while (scope.getSymbol(variable.name).val >= v_final) {
        scope.io.outputAddDetails(
          "Η συνθήκη της ΓΙΑ " +
            variable.name +
            ">=" +
            v_final +
            " είναι ΑΛΗΘΗΣ",
          this.cmdLineNoGia
        );

        scope.incrLogicalCounter();

        await body.resolve(scope);

        await scope.setActiveLine(this.cmdLineNoTelosEpanalhpshs);

        await scope.setActiveLine(this.cmdLineNoGia);

        scope.removeLock(variable.name);
        scope.setSymbol(
          variable.name,
          new Atom.MNumber(scope.getSymbol(variable.name).val + v_step)
        );
        scope.addLock(variable.name);
      }

      scope.io.outputAddDetails(
        "Η συνθήκη της ΓΙΑ " + variable.name + ">=" + v_final + " είναι ΨΕΥΔΗΣ",
        this.cmdLineNoGia
      );
    }

    scope.removeLock(variable.name);
  }
}

class CallSubFunction extends Stmt {
  constructor(fun, args, cmdLineNo) {
    super();
    this.fun = fun;
    this.args = args;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(scope) {
    //scope.cmdLineNo = this.cmdLineNo; //FIXME: not wanted here

    scope.io.outputAddDetails(
      "Κλήση της Συνάρτησης " + this.fun.name,
      this.cmdLineNo
    );

    if (!scope.hasSymbol(this.fun.name))
      throw new GE.GError(
        "Η συνάρτηση " + this.fun.name + " δεν βρέθηκε.",
        this.cmdLineNo
      );

    var argsResolved = this.args.map((arg) => arg.resolve(scope)); // FIXME: need await here

    var sendData = [];
    sendData[0] = argsResolved;
    sendData[1] = scope;
    sendData[2] = this.cmdLineNo;

    var fun = scope.getGlobalSymbol(this.fun.name);

    var valReturned = await fun.apply(this, sendData);

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

class CallSubProcedure extends Stmt {
  constructor(fun, args, cmdLineNo) {
    super();
    this.fun = fun;
    this.args = args;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(scope) {
    await scope.setActiveLine(this.cmdLineNo);

    scope.io.outputAddDetails(
      "Κλήση της Διαδικασίας " + this.fun.name,
      this.cmdLineNo
    );

    if (!scope.hasSymbol(this.fun.name))
      throw new GE.GError(
        "Η διαδικασία " + this.fun.name + "δεν βρέθηκε.",
        this.cmdLineNo
      );

    var argsResolved = this.args.map((arg) => arg.resolve(scope)); // FIXME: need await here

    var fun = scope.getGlobalSymbol(this.fun.name);

    var sendData = [];
    sendData[0] = argsResolved;
    sendData[1] = scope;

    var recvData = await fun.apply(null, sendData);

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

class SubFunction extends Stmt {
  constructor(name, params, funType, declarations, body, cmdLineNo) {
    super();
    this.name = name;
    this.params = params;
    this.funType = funType;
    this.declarations = declarations;
    this.body = body;
    this.cmdLineNo = cmdLineNo;
  }

  async resolve(scope) {
    var name = this.name.name;
    var params = this.params;
    var funType = this.funType;
    var declarations = this.declarations;
    var body = this.body;
    var cmdLineNo = this.cmdLineNo;

    scope.addSymbol(
      name,
      new STR.STRUserFunction(
        async function (...arrargs) {
          await scope.setActiveLine(cmdLineNo);

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

          await declarations.resolve(scope2);

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
                var tblsize1 = args[i].getSize()[0];
                var tblsize2 = args[i].getSize()[1];
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

          await body.resolve(scope2);

          if (!scope2.getSymbol(name))
            throw new GE.GError(
              "Η συνάρτηση δεν επέστρεψε τιμή με το όνομά της."
            );

          return scope2.getSymbol(name);
        }.bind(this)
      )
    );
  }
}

class SubProcedure extends Stmt {
  constructor(name, params, declarations, body, cmdLineNo) {
    super();
    this.name = name;
    this.params = params;
    this.declarations = declarations;
    this.body = body;
    this.cmdLineNo = cmdLineNo;
  }

  async resolve(scope) {
    var name = this.name.name;
    var params = this.params;
    var declarations = this.declarations;
    var body = this.body;

    scope.addSymbol(
      name,
      new STR.STRUserProcedure(
        async function (...arrargs) {
          await scope.setActiveLine(this.cmdLineNo);

          var args = arrargs[0];
          var parentScope = arrargs[1];

          if (args.length != params.length)
            throw new GE.GError(
              "Λάθος αριθμός παραμέτρων κατά την κλήση της διαδικασίας."
            );

          var scope2 = scope.makeSubScope();

          // Declare constants and variables
          await declarations.resolve(scope2);

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
                var tblsize1 = args[i].getSize()[0];
                var tblsize2 = args[i].getSize()[1];
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

          await body.resolve(scope2);

          var procExecArr = [scope2, params];

          return procExecArr;
        }.bind(this)
      )
    );
  }
}

class DefDeclarations extends Stmt {
  constructor(constants, variables) {
    super();
    this.constants = constants;
    this.variables = variables;
  }
  async resolve(scope) {
    if (this.constants[0])
      for (const a of this.constants[0]) {
        await a.resolve(scope);
      }

    if (this.variables[0])
      for (const a of this.variables[0]) {
        await a.resolve(scope);
      }

  }
}

class DefConstant extends Stmt {
  constructor(sym, val, cmdLineNo) {
    super();
    this.sym = sym;
    this.val = val;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(scope) {
    await scope.setActiveLine(this.cmdLineNo);

    var obj = await this.val.resolve(scope);

    if (HP.isInt(obj.val)) var newObj = new STR.STRInt(obj);
    else if (HP.isFloat(obj.val)) var newObj = new STR.STRFloat(obj);
    else if (HP.isString(obj.val)) var newObj = new STR.STRString(obj);
    else if (HP.isBoolean(obj.val)) var newObj = new STR.STRBoolean(obj);
    else throw new GE.GError("Critical: Unknown constant type");

    scope.addSymbol(this.sym.name, newObj);

    scope.addLock(this.sym.name);
  }
}

class DefVariables extends Stmt {
  constructor(varType, sym, cmdLineNo) {
    super();
    this.varType = varType;
    this.sym = sym;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(scope) {
    await scope.setActiveLine(this.cmdLineNo);

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

class Program extends Stmt {
  constructor(
    progname,
    declarations,
    body,
    cmdLineNoProgramma,
    cmdLineNoArxh,
    cmdLineNoTelosProgrammatos
  ) {
    super();
    this.progname = progname;
    this.declarations = declarations;
    this.body = body;
    this.cmdLineNoProgramma = cmdLineNoProgramma;
    this.cmdLineNoArxh = cmdLineNoArxh;
    this.cmdLineNoTelosProgrammatos = cmdLineNoTelosProgrammatos;
  }

  async resolve(scope) {
    scope.addSymbol(this.progname.name, new STR.STRReservedName(null));

    await scope.setActiveLine(this.cmdLineNoProgramma);

    await this.declarations.resolve(scope);

    await scope.setActiveLine(this.cmdLineNoArxh);

    await this.body.resolve(scope);

    await scope.setActiveLine(this.cmdLineNoTelosProgrammatos);
  }
}

class InlineKeyboardInput {
  constructor(args) {
    this.args = args;
  }
  async resolve(scope) {
    for (const arg of this.args) {
      var argResolved = await arg.resolve(scope);
      scope.io.inputAddToBuffer(argResolved.val);
    }
  }
}

class Application {
  constructor(inputdata, program, subprograms) {
    this.inputdata = inputdata;
    this.program = program;
    this.subprograms = subprograms;
  }
  async resolve(scope) {
    if (scope.io.inputIsEmptyBuffer())
      for (const a of this.inputdata) {
        await a.resolve(scope);
      }

    if (this.subprograms.length)
      for (const a of this.subprograms) {
        await a.resolve(scope);
      }

    await this.program.resolve(scope);
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
