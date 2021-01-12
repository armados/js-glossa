"use strict";

const Atom = require("./atom");
const GE = require("./gclasses");
const STR = require("./storage");
const HP = require("./helper");

class Stmt {}

// ========================

class Stmt_Assignment extends Stmt {
  constructor(sym, val, cmdStrA, cmdStrB, cmdLineNo) {
    super();
    this.symbol = sym;
    this.val = val;
    this.cmdStrA = cmdStrA;
    this.cmdStrB = cmdStrB;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(app, scope) {
    await app.setActiveLine(scope, this.cmdLineNo);

    var sym = this.symbol;

    if (sym instanceof Atom.MSymbolTableCell) sym = await sym.eval(app, scope);

    var valResolved = await this.val.resolve(app, scope);

    app.outputAddDetails(
      "Εντολή εκχώρησης: " + this.cmdStrA + " <- " + this.cmdStrB,
      this.cmdLineNo
    );

    scope.setSymbol(sym.name, valResolved);

    app.incrAssignCounter();
  }
}

class Stmt_Write extends Stmt {
  constructor(args, cmdLineNo) {
    super();
    this.args = args;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(app, scope) {
    await app.setActiveLine(scope, this.cmdLineNo);

    var output = [];

    for (var i = 0, len = this.args.length; i < len; i++) {
      //await app.setActiveLineWithoutStep(scope, this.cmdLineNo); FIXME: not needed here??

      var argParam = this.args[i];

      if (argParam instanceof Atom.MSymbolTableCell)
        argParam = await argParam.eval(app, scope);

      var arg = await argParam.resolve(app, scope);

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

    var str = output.join(" ");
    app.outputAdd(str);
    app.outputAddDetails("Εμφάνισε στην οθόνη: " + str, this.cmdLineNo);
  }
}

class Stmt_Read extends Stmt {
  constructor(args, cmdLineNo) {
    super();
    this.args = args;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(app, scope) {
    await app.setActiveLine(scope, this.cmdLineNo);

    for (var i = 0, len = this.args.length; i < len; i++) {
      await app.setActiveLineWithoutStep(scope, this.cmdLineNo);

      var arg = this.args[i];

      if (arg instanceof Atom.MSymbolTableCell)
        arg = await arg.eval(app, scope);

      var data = app.inputFetchValueFromBuffer();

      if (data == null && typeof app["inputFunction"] === "function") {
        data = await app["inputFunction"].apply(this, [arg.name]);

        if (data != null) {
          if (scope.getSymbolObject(arg.name) instanceof STR.STRString) {
            data = String(data);
          } else if (scope.getSymbolObject(arg.name) instanceof STR.STRFloat) {
            if (!isNaN(parseFloat(data))) {
              data = parseFloat(data);
            } else {
              data = String(data);
            }
          } else if (scope.getSymbolObject(arg.name) instanceof STR.STRInt) {
            if (!isNaN(parseInt(data))) {
              data = parseInt(data);
            } else {
              data = String(data);
            }
          }
        }
      }

      if (data == null)
        throw new GE.GError(
          "Τα δεδομένα εισόδου δεν επαρκούν για την εκτέλεση του προγράμματος.",
          this.cmdLineNo
        );

      app.outputAddDetails(
        "Εισαγωγή από το πληκτρολόγιο της τιμής " +
          data +
          " στο αναγνωριστικό " +
          arg.name,
        this.cmdLineNo
      );

      switch (typeof data) {
        case "string":
          var sym = new Atom.MString(data);
          break;
        case "number":
          var sym = new Atom.MNumber(data);
          break;
        case "boolean":
          var sym = new Atom.MBoolean(data);
          break;
        default:
          throw new GE.GError("Critical: Unknown input value type: " + data);
      }

      scope.setSymbol(arg.name, sym);
      app.postMessage("inputread", data);
    }
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

  async resolve(app, scope) {
    var arrCond = this.arrCond;
    var arrCondStr = this.arrCondStr;
    var arrLineNo = this.arrLineNo;
    var arrBody = this.arrBody;
    var elseBody = this.elseBody;
    var elseBodyLine = this.elseBodyLine;

    for (var i = 0; i < arrCond.length; ++i) {
      await app.setActiveLine(scope, this.arrLineNo[i]);

      var condResult = await arrCond[i].resolve(app, scope);

      if (!(condResult instanceof Atom.MBoolean))
        throw new GE.GError(
          "Η συνθήκη της ΑΝ δεν αποτελεί λογική έκφραση." +
            "\n" +
            HP.valueTypeToString(condResult),
          arrLineNo[i]
        );

      app.outputAddDetails(
        "Η συνθήκη της ΑΝ " +
          arrCondStr[i] +
          " έχει τιμή " +
          (condResult.val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ"),
        arrLineNo[i]
      );

      app.incrLogicalCounter();

      if (condResult.val == true) {
        await arrBody[i].resolve(app, scope);
        await app.setActiveLine(scope, this.telosAnLine);
        return;
      }
    }

    if (elseBody != null) {
      await app.setActiveLine(scope, this.elseBodyLine);

      app.outputAddDetails(
        "Εκτέλεση του τμήματος εντολών της ΑΛΛΙΩΣ",
        elseBodyLine
      );

      await elseBody.resolve(app, scope);
      await app.setActiveLine(scope, this.telosAnLine);
      return;
    }

    await app.setActiveLine(scope, this.telosAnLine);
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

  async resolve(app, scope) {
    await app.setActiveLine(scope, this.cmdLineNo);

    var expr = this.expr;
    var arrCond = this.arrCond;
    var arrCondStr = this.arrCondStr;
    var arrLineNo = this.arrLineNo;
    var arrBody = this.arrBody;
    var elseBody = this.elseBody;
    var elseBodyLine = this.elseBodyLine;
    var cmdLineNoTelosEpilogwn = this.cmdLineNoTelosEpilogwn;

    //console.log(arrCond);
    var exprResult = await expr.resolve(app, scope);

    if (exprResult instanceof STR.STRTableName)
      throw new GE.GError(
        "Στην εντολή ΕΠΙΛΕΞΕ επιτρέπονται εκφράσεις όλων των τύπων δεδομένων αλλά όχι πίνακες.",
        this.cmdLineNo
      );

    for (var i = 0; i < arrCond.length; ++i) {
      for (var j = 0; j < arrCond[i].length; ++j) {
        await app.setActiveLine(scope, arrLineNo[i]);

        var condResult = await arrCond[i][j].resolve(app, scope);
        //console.log("select PERIPTOSI resolved value: " + condResult);
        //console.log(condResult);

        if (!(condResult instanceof Atom.MBoolean))
          throw new GE.GError(
            "Η συνθήκη της ΕΠΙΛΕΞΕ δεν αποτελεί λογική έκφραση." +
              "\n" +
              HP.valueTypeToString(condResult),
            arrLineNo[i]
          );

        app.outputAddDetails(
          "Η συνθήκη της ΕΠΙΛΕΞΕ " +
            arrCondStr[i] +
            " έχει τιμή " +
            (condResult.val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ"),
          arrLineNo[i]
        );

        app.incrLogicalCounter();

        if (condResult.val == true) {
          //fixeme!  fix line here
          await arrBody[i].resolve(app, scope);
          await app.setActiveLine(scope, cmdLineNoTelosEpilogwn);
          return;
        }
      }
    }

    if (elseBody != null) {
      await app.setActiveLine(scope, elseBodyLine);

      app.outputAddDetails(
        "Εκτέλεση του τμήματος εντολών της ΑΛΛΙΩΣ",
        elseBodyLine
      );

      await elseBody.resolve(app, scope);
      await app.setActiveLine(scope, cmdLineNoTelosEpilogwn);
      return;
    }

    await app.setActiveLine(scope, cmdLineNoTelosEpilogwn);
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
  async resolve(app, scope) {
    while (true) {
      await app.setActiveLine(scope, this.cmdLineNoOso);

      var condResult = await this.cond.resolve(app, scope);

      if (!(condResult instanceof Atom.MBoolean))
        throw new GE.GError(
          "Η συνθήκη της ΟΣΟ δεν αποτελεί λογική έκφραση." +
            "\n" +
            HP.valueTypeToString(condResult),
          this.cmdLineNoOso
        );

      app.outputAddDetails(
        "Η συνθήκη της ΟΣΟ " +
          this.condstr +
          " έχει τιμή " +
          (condResult.val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ"),
        this.cmdLineNoOso
      );

      app.incrLogicalCounter();

      if (condResult.val == true) break;

      await this.body.resolve(app, scope);

      await app.setActiveLine(scope, this.cmdLineNoTelosEpanalhpshs);
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
  async resolve(app, scope) {
    do {
      await app.setActiveLine(scope, this.cmdLineNoArxh);

      await this.body.resolve(app, scope);

      await app.setActiveLine(scope, this.cmdLineNoMexrisOtou);

      var condResult = await this.cond.resolve(app, scope);

      if (!(condResult instanceof Atom.MBoolean))
        throw new GE.GError(
          "Η συνθήκη της ΜΕΧΡΙΣ_ΟΤΟΥ δεν αποτελεί λογική έκφραση." +
            "\n" +
            HP.valueTypeToString(condResult),
          this.cmdLineNoMexrisOtou
        );

      app.outputAddDetails(
        "Η συνθήκη της ΜΕΧΡΙΣ_ΟΤΟΥ " +
          this.condstr +
          " έχει τιμή " +
          (condResult.val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ"),
        this.cmdLineNoMexrisOtou
      );

      app.incrLogicalCounter();
    } while (condResult.val == false);
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
  async resolve(app, scope) {
    await app.setActiveLine(scope, this.cmdLineNoGia);

    var variable = this.variable;
    var initval = this.initval;
    var finalval = this.finalval;
    var stepval = this.stepval;
    var body = this.body;

    var v_step = 1;

    if (stepval != "") {
      var tmp = await stepval[0].resolve(app, scope);
      v_step = tmp.val;
    }

    if (v_step == 0)
      throw new GE.GError(
        "Το βήμα της εντολή ΓΙΑ δεν μπορεί να λάβει την τιμή μηδέν.",
        this.cmdLineNoGia
      );

    var tmp = await initval.resolve(app, scope);
    var v_initial = tmp.val;

    var tmp = await finalval.resolve(app, scope);
    var v_final = tmp.val;

    if (variable instanceof Atom.MSymbolTableCell)
      variable = await variable.eval(app, scope);

    scope.setSymbol(variable.name, new Atom.MNumber(v_initial));
    scope.addLock(variable.name);

    if (v_initial <= v_final && v_step > 0) {
      do {
        app.outputAddDetails(
          "Η συνθήκη της ΓΙΑ " +
            variable.name +
            "<=" +
            v_final +
            " είναι ΑΛΗΘΗΣ",
          this.cmdLineNoGia
        );

        app.incrLogicalCounter();

        await body.resolve(app, scope);

        await app.setActiveLine(scope, this.cmdLineNoTelosEpanalhpshs);

        await app.setActiveLine(scope, this.cmdLineNoGia);

        scope.removeLock(variable.name);

        scope.setSymbol(
          variable.name,
          new Atom.MNumber(scope.getSymbol(variable.name).val + v_step)
        );
        scope.addLock(variable.name);
      } while (scope.getSymbol(variable.name).val <= v_final);

      app.outputAddDetails(
        "Η συνθήκη της ΓΙΑ " + variable.name + "<=" + v_final + " είναι ΨΕΥΔΗΣ",
        this.cmdLineNoGia
      );

      app.incrLogicalCounter();
    } else if (v_initial >= v_final && v_step < 0) {
      do {
        app.outputAddDetails(
          "Η συνθήκη της ΓΙΑ " +
            variable.name +
            ">=" +
            v_final +
            " είναι ΑΛΗΘΗΣ",
          this.cmdLineNoGia
        );

        app.incrLogicalCounter();

        await body.resolve(app, scope);

        await app.setActiveLine(scope, this.cmdLineNoTelosEpanalhpshs);

        await app.setActiveLine(scope, this.cmdLineNoGia);

        scope.removeLock(variable.name);
        scope.setSymbol(
          variable.name,
          new Atom.MNumber(scope.getSymbol(variable.name).val + v_step)
        );
        scope.addLock(variable.name);
      } while (scope.getSymbol(variable.name).val >= v_final);

      app.outputAddDetails(
        "Η συνθήκη της ΓΙΑ " + variable.name + ">=" + v_final + " είναι ΨΕΥΔΗΣ",
        this.cmdLineNoGia
      );

      app.incrLogicalCounter();
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
  async resolve(app, scope) {
    app.outputAddDetails(
      "Κλήση της Συνάρτησης " + this.fun.name,
      this.cmdLineNo
    );

    if (
      !scope.hasSymbol(this.fun.name) ||
      !(scope.getSymbolObject(this.fun.name) instanceof STR.STRUserFunction)
    )
      throw new GE.GError(
        "Η συνάρτηση " + this.fun.name + " δεν βρέθηκε.",
        this.cmdLineNo
      );

    var argsResolved = [];
    for (const arg of this.args) {
      var argRes = await arg.resolve(app, scope);
      argsResolved.push(argRes);
    }

    var sendData = [];
    sendData[0] = argsResolved;
    sendData[1] = scope;

    var fun = scope.getGlobalSymbol(this.fun.name);

    var valReturned = await fun.apply(this, sendData);

    app.outputAddDetails(
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
  async resolve(app, scope) {
    await app.setActiveLine(scope, this.cmdLineNo);

    app.outputAddDetails(
      "Κλήση της Διαδικασίας " + this.fun.name,
      this.cmdLineNo
    );

    if (
      !scope.hasSymbol(this.fun.name) ||
      !(scope.getSymbolObject(this.fun.name) instanceof STR.STRUserProcedure)
    )
      throw new GE.GError(
        "Η διαδικασία " + this.fun.name + " δεν βρέθηκε.",
        this.cmdLineNo
      );

    var argsResolved = [];
    for (const arg of this.args) {
      var argRes = await arg.resolve(app, scope);
      argsResolved.push(argRes);
    }

    var fun = scope.getGlobalSymbol(this.fun.name);

    var sendData = [];
    sendData[0] = argsResolved;
    sendData[1] = scope;

    var recvData = await fun.apply(null, sendData);

    await app.setActiveLine(scope, this.cmdLineNo);

    app.outputAddDetails(
      "Επιστροφή από την διαδικασία " + this.fun.name,
      this.cmdLineNo
    );

    var procScope = recvData[0];
    var procParams = recvData[1];

    this.args.map(async function (arg, i) {
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
        arg = await arg.eval(app, scope);
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
  constructor(
    name,
    params,
    funType,
    declarations,
    body,
    cmdLineNo,
    cmdLineNoTelosSynartisis
  ) {
    super();
    this.name = name;
    this.params = params;
    this.funType = funType;
    this.declarations = declarations;
    this.body = body;
    this.cmdLineNo = cmdLineNo;
    this.cmdLineNoTelosSynartisis = cmdLineNoTelosSynartisis;
  }

  async resolve(app, scope) {
    var name = this.name.name;
    var params = this.params;
    var funType = this.funType;
    var declarations = this.declarations;
    var body = this.body;

    scope.addSymbol(
      name,
      new STR.STRUserFunction(
        async function (...arrargs) {
          var scope2 = scope.makeSubScope();

          await app.setActiveLine(scope2, this.cmdLineNo);

          var args = arrargs[0];
          var parentScope = arrargs[1];

          if (args.length != params.length)
            throw new GE.GError(
              "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης."
            );

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

          await declarations.resolve(app, scope2);

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

          await body.resolve(app, scope2);

          await app.setActiveLine(scope2, this.cmdLineNoTelosSynartisis);

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
  constructor(
    name,
    params,
    declarations,
    body,
    cmdLineNo,
    cmdLineNoTelosDiadikasias
  ) {
    super();
    this.name = name;
    this.params = params;
    this.declarations = declarations;
    this.body = body;
    this.cmdLineNo = cmdLineNo;
    this.cmdLineNoTelosDiadikasias = cmdLineNoTelosDiadikasias;
  }

  async resolve(app, scope) {
    var name = this.name.name;
    var params = this.params;
    var declarations = this.declarations;
    var body = this.body;

    scope.addSymbol(
      name,
      new STR.STRUserProcedure(
        async function (...arrargs) {
          var scope2 = scope.makeSubScope();

          await app.setActiveLine(scope2, this.cmdLineNo);

          var args = arrargs[0];
          var parentScope = arrargs[1];

          if (args.length != params.length)
            throw new GE.GError(
              "Λάθος αριθμός παραμέτρων κατά την κλήση της διαδικασίας."
            );

          // Declare constants and variables
          await declarations.resolve(app, scope2);

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

          await body.resolve(app, scope2);

          await app.setActiveLine(scope2, this.cmdLineNoTelosDiadikasias);

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
  async resolve(app, scope) {
    if (this.constants[0])
      for (const a of this.constants[0]) {
        await a.resolve(app, scope);
      }

    if (this.variables[0])
      for (const a of this.variables[0]) {
        await a.resolve(app, scope);
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
  async resolve(app, scope) {
    await app.setActiveLine(scope, this.cmdLineNo);

    var obj = await this.val.resolve(app, scope);

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
  async resolve(app, scope) {
    await app.setActiveLine(scope, this.cmdLineNo);

    var varType = this.varType;
    //console.log('======> DefVariables: : ', varType);

    for (const e of this.sym) {
      //this.sym.forEach(function (e) {
      //console.log('======> DefVariables: Create variable symbol name: ', e.name, varType, e);
      //console.log(e.args);
      if (e instanceof Atom.MSymbolTableCell) {
        //console.log('======> DefVariables: Create variable TABLE symbol name: ', e.name, varType);

        var argsResolved = [];
        for (const arg of e.args) {
          //console.log('==> arg: ' + arg);
          var argRes = await arg.resolve(app, scope);
          argsResolved.push(argRes.val);
        }

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
      } else {
        if (varType == "ΑΚΕΡΑΙΕΣ") var ctype = new STR.STRInt(null);
        else if (varType == "ΠΡΑΓΜΑΤΙΚΕΣ") var ctype = new STR.STRFloat(null);
        else if (varType == "ΧΑΡΑΚΤΗΡΕΣ") var ctype = new STR.STRString(null);
        else if (varType == "ΛΟΓΙΚΕΣ") var ctype = new STR.STRBoolean(null);
        else throw new GE.GError("Critical: Cannot detect variable type");

        scope.addSymbol(e.name, ctype);
      }
    }
  }
}

class Stmt_Block {
  constructor(block) {
    this.block = block;
  }
  async resolve(app, scope) {
    for (const stmt of this.block) {
      await stmt.resolve(app, scope);
    }
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

  async resolve(app, scope) {
    scope.addSymbol(this.progname.name, new STR.STRReservedName(null));

    await app.setActiveLine(scope, this.cmdLineNoProgramma);

    await this.declarations.resolve(app, scope);

    await app.setActiveLine(scope, this.cmdLineNoArxh);

    await this.body.resolve(app, scope);

    await app.setActiveLine(scope, this.cmdLineNoTelosProgrammatos);
  }
}

class InlineKeyboardInput {
  constructor(args) {
    this.args = args;
  }
  async resolve(app, scope) {
    for (const arg of this.args) {
      var argResolved = await arg.resolve(app, scope);
      app.inputAddToBuffer(argResolved.val);
    }
  }
}

class Application {
  constructor(inputdata, program, subprograms) {
    this.inputdata = inputdata;
    this.program = program;
    this.subprograms = subprograms;
  }
  async resolve(app, scope) {
    if (app.inputIsEmptyBuffer())
      for (const a of this.inputdata) {
        await a.resolve(app, scope);
      }

    if (this.subprograms.length)
      for (const a of this.subprograms) {
        await a.resolve(app, scope);
      }

    await this.program.resolve(app, scope);
  }
}

module.exports = {
  Stmt_Assignment,

  Stmt_Write,
  Stmt_Read,

  Stmt_IfCond,
  Stmt_Select,

  Stmt_WhileLoop,
  Stmt_Do_WhileLoop,
  Stmt_ForLoop,

  Stmt_Block,

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
