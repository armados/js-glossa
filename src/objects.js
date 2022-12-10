"use strict";

const Atom = require("./atom");
const GE = require("./gclasses");
const STR = require("./storage");
const HP = require("./helper");

class Stmt_Assignment {
  constructor(sym, val, cmdStrA, cmdStrB, cmdLineNo) {
    this.symbol = sym;
    this.val = val;
    this.cmdStrA = cmdStrA;
    this.cmdStrB = cmdStrB;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(env) {
    env.getCounters().incrStmt_Assignment();

    await env.setActiveLine(this.cmdLineNo);

    var sym = this.symbol;

    if (sym instanceof Atom.MSymbolTableCell) sym = await sym.eval(env);

    var valResolved = await this.val.resolve(env);

    env.outputAddDetails(
      "Εντολή εκχώρησης: " + this.cmdStrA + " <- " + this.cmdStrB,
      this.cmdLineNo
    );

    env.getScope().setSymbol(sym.name, valResolved);

    env.postMessage(
      "memorysymbolupdate",
      sym.name,
      HP.formatValueForOutput(valResolved.getValue())
    );
  }
}

class Stmt_Write {
  constructor(args, cmdLineNo) {
    this.args = args;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(env) {
    env.getCounters().incrStmt_Write();

    await env.setActiveLine(this.cmdLineNo);

    var output = [];

    var prevTypeStringOrBoolean = true;

    for (var i = 0, len = this.args.length; i < len; i++) {
      var argParam = this.args[i];

      if (argParam instanceof Atom.MSymbolTableCell)
        argParam = await argParam.eval(env);

      var arg = await argParam.resolve(env);

      if (arg == null)
        throw new GE.GError(
          "Το αναγνωριστικό " + argParam.name + " δεν έχει αρχικοποιηθεί.",
          this.cmdLineNo
        );

      if (arg instanceof Atom.MBoolean)
        var out = arg.getValue() ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ";
      else if (arg instanceof Atom.MNumber)
        var out = Math.round(arg.getValue() * 100) / 100;
      else var out = arg.getValue();

      // check to include or not space char at beginning
      var addPreSpaceChar = true;
      if (
        arg instanceof Atom.MString ||
        arg instanceof Atom.MBoolean ||
        prevTypeStringOrBoolean == true
      )
        addPreSpaceChar = false;

      if (arg instanceof Atom.MString || arg instanceof Atom.MBoolean)
        prevTypeStringOrBoolean = true;
      else prevTypeStringOrBoolean = false;

      const fOut = addPreSpaceChar ? " " + out : out;
      output.push(fOut);
    }

    var str = output.join("");
    env.outputAdd(str);
    env.outputAddDetails("Εμφάνισε στην οθόνη: " + str, this.cmdLineNo);
  }
}

class Stmt_Read {
  constructor(args, cmdLineNo) {
    this.args = args;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(env) {
    env.getCounters().incrStmt_Read();

    await env.setActiveLine(this.cmdLineNo);

    for (var i = 0, len = this.args.length; i < len; i++) {
      await env.setActiveLineWithoutStep(this.cmdLineNo);

      var arg = this.args[i];

      if (arg instanceof Atom.MSymbolTableCell) arg = await arg.eval(env);

      var data = env.inputFetchValueFromBuffer();

      if (data == null && typeof env.inputFunction === "function") {
        var finishedPromise = false;

        const pro1 = env.inputFunction.apply(this, [arg.name]);

        const pro2 = new Promise(async (resolve, reject) => {
          while (!env.isTerminationFlag() && finishedPromise == false) {
            await HP.sleepFunc(100);
          }
          reject("user-interrupt");
        });

        await Promise.race([pro1, pro2])
          .then((response) => {
            data = response;
            finishedPromise = true;
          })
          .catch((err) => {
            throw new GE.GInterrupt(
              "Διακοπή της εκτέλεσης του προγράμματος από τον χρήστη.",
              this.cmdLineNo
            );
          });

        if (data != null) {
          if (
            env.getScope().getSymbolObject(arg.name) instanceof
              STR.STRVariableString ||
            env.getScope().getSymbolObject(arg.name) instanceof
              STR.STRTableCellString
          ) {
            data = String(data);
          } else if (
            env.getScope().getSymbolObject(arg.name) instanceof
              STR.STRVariableInt ||
            env.getScope().getSymbolObject(arg.name) instanceof
              STR.STRTableCellInt
          ) {
            if (HP.StringIsNumInt(data)) {
              data = parseInt(data);
            } else {
              data = String(data);
            }
          } else if (
            env.getScope().getSymbolObject(arg.name) instanceof
              STR.STRVariableFloat ||
            env.getScope().getSymbolObject(arg.name) instanceof
              STR.STRTableCellFloat
          ) {
            if (HP.StringIsNumFloat(data)) {
              data = parseFloat(data);
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

      env.outputAddDetails(
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

      env.getScope().setSymbol(arg.name, sym);

      env.getCounters().incrKeyboardValues();

      env.postMessage(
        "memorysymbolupdate",
        arg.name,
        HP.formatValueForOutput(sym.getValue())
      );

      env.postMessage("inputread", data);
    }
  }
}

class Stmt_If {
  constructor(
    arrCond,
    arrCondStr,
    arrLineNo,
    arrBody,
    elseBody,
    elseBodyLine,
    telosAnLine
  ) {
    this.arrCond = arrCond;
    this.arrCondStr = arrCondStr;
    this.arrLineNo = arrLineNo;
    this.arrBody = arrBody;
    this.elseBody = elseBody;
    this.elseBodyLine = elseBodyLine;
    this.telosAnLine = telosAnLine;
  }

  async resolve(env) {
    var arrCond = this.arrCond;
    var arrCondStr = this.arrCondStr;
    var arrLineNo = this.arrLineNo;
    var arrBody = this.arrBody;
    var elseBody = this.elseBody;
    var elseBodyLine = this.elseBodyLine;

    if (arrCond.length > 1) env.getCounters().incrStmt_If_Then_ElseIf();
    else if (arrCond.length == 1 && elseBody == null)
      env.getCounters().incrStmt_If_Then();
    else if (arrCond.length == 1 && elseBody != null)
      env.getCounters().incrStmt_If_Then_Else();

    for (var i = 0; i < arrCond.length; ++i) {
      await env.setActiveLine(this.arrLineNo[i]);

      var condResult = await arrCond[i].resolve(env);

      if (!(condResult instanceof Atom.MBoolean))
        throw new GE.GError(
          "Η συνθήκη δεν αποτελεί λογική έκφραση." +
            "\n" +
            HP.valueTypeToString(condResult),
          arrLineNo[i]
        );

      env.outputAddDetails(
        "Η συνθήκη " +
          arrCondStr[i] +
          " έχει τιμή " +
          (condResult.val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ"),
        arrLineNo[i]
      );

      env.getCounters().incrConditionTests();

      if (condResult.val == true) {
        await arrBody[i].resolve(env);
        await env.setActiveLine(this.telosAnLine);
        return;
      }
    }

    if (elseBody != null) {
      await env.setActiveLine(this.elseBodyLine);
      await elseBody.resolve(env);
      await env.setActiveLine(this.telosAnLine);
      return;
    }

    await env.setActiveLine(this.telosAnLine);
  }
}

class Stmt_Case {
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

  async resolve(env) {
    env.getCounters().incrStmt_Case();

    await env.setActiveLine(this.cmdLineNo);

    var expr = this.expr;
    var arrCond = this.arrCond;
    var arrCondStr = this.arrCondStr;
    var arrLineNo = this.arrLineNo;
    var arrBody = this.arrBody;
    var elseBody = this.elseBody;
    var elseBodyLine = this.elseBodyLine;
    var cmdLineNoTelosEpilogwn = this.cmdLineNoTelosEpilogwn;

    var exprResult = await expr.resolve(env);

    if (exprResult instanceof STR.STRTableName)
      throw new GE.GError(
        "Στην εντολή ΕΠΙΛΕΞΕ επιτρέπονται εκφράσεις όλων των τύπων δεδομένων αλλά όχι πίνακες.",
        this.cmdLineNo
      );

    for (var i = 0; i < arrCond.length; ++i) {
      for (var j = 0; j < arrCond[i].length; ++j) {
        await env.setActiveLine(arrLineNo[i]);

        var condResult = await arrCond[i][j].resolve(env);

        if (!(condResult instanceof Atom.MBoolean))
          throw new GE.GError(
            "Η συνθήκη δεν αποτελεί λογική έκφραση." +
              "\n" +
              HP.valueTypeToString(condResult),
            arrLineNo[i]
          );

        env.getCounters().incrConditionTests();

        if (condResult.val == true) {
          break;
        }
      }

      env.outputAddDetails(
        "Η περίπτωση " +
          arrCondStr[i] +
          " έχει τιμή " +
          (condResult.val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ"),
        arrLineNo[i]
      );

      if (condResult.val == true) {
        await arrBody[i].resolve(env);
        await env.setActiveLine(cmdLineNoTelosEpilogwn);
        return;
      }
    }

    if (elseBody != null) {
      await env.setActiveLine(elseBodyLine);
      await elseBody.resolve(env);
      await env.setActiveLine(cmdLineNoTelosEpilogwn);
      return;
    }

    await env.setActiveLine(cmdLineNoTelosEpilogwn);
  }
}

class Stmt_While {
  constructor(cond, condstr, body, cmdLineNoOso, cmdLineNoTelosEpanalhpshs) {
    this.cond = cond;
    this.condstr = condstr;
    this.body = body;
    this.cmdLineNoOso = cmdLineNoOso;
    this.cmdLineNoTelosEpanalhpshs = cmdLineNoTelosEpanalhpshs;
  }
  async resolve(env) {
    env.getCounters().incrStmt_While();

    while (true) {
      await env.setActiveLine(this.cmdLineNoOso);

      var condResult = await this.cond.resolve(env);

      if (!(condResult instanceof Atom.MBoolean))
        throw new GE.GError(
          "Η συνθήκη δεν αποτελεί λογική έκφραση." +
            "\n" +
            HP.valueTypeToString(condResult),
          this.cmdLineNoOso
        );

      env.outputAddDetails(
        "Η συνθήκη " +
          this.condstr +
          " έχει τιμή " +
          (condResult.val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ"),
        this.cmdLineNoOso
      );

      env.getCounters().incrConditionTests();

      if (condResult.val == false) break;

      await this.body.resolve(env);

      await env.setActiveLine(this.cmdLineNoTelosEpanalhpshs);
    }
  }
}

class Stmt_Do_While {
  constructor(cond, condstr, body, cmdLineNoArxh, cmdLineNoMexrisOtou) {
    this.cond = cond;
    this.condstr = condstr;
    this.body = body;
    this.cmdLineNoArxh = cmdLineNoArxh;
    this.cmdLineNoMexrisOtou = cmdLineNoMexrisOtou;
  }
  async resolve(env) {
    env.getCounters().incrStmt_Do_While();

    do {
      await env.setActiveLine(this.cmdLineNoArxh);

      await this.body.resolve(env);

      await env.setActiveLine(this.cmdLineNoMexrisOtou);

      var condResult = await this.cond.resolve(env);

      if (!(condResult instanceof Atom.MBoolean))
        throw new GE.GError(
          "Η συνθήκη δεν αποτελεί λογική έκφραση." +
            "\n" +
            HP.valueTypeToString(condResult),
          this.cmdLineNoMexrisOtou
        );

      env.outputAddDetails(
        "Η συνθήκη " +
          this.condstr +
          " έχει τιμή " +
          (condResult.val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ"),
        this.cmdLineNoMexrisOtou
      );

      env.getCounters().incrConditionTests();
    } while (condResult.val == false);
  }
}

class Stmt_For {
  constructor(
    variable,
    initval,
    finalval,
    stepval,
    body,
    cmdLineNoGia,
    cmdLineNoTelosEpanalhpshs
  ) {
    this.variable = variable;
    this.initval = initval;
    this.finalval = finalval;
    this.stepval = stepval;
    this.body = body;
    this.cmdLineNoGia = cmdLineNoGia;
    this.cmdLineNoTelosEpanalhpshs = cmdLineNoTelosEpanalhpshs;
  }
  async resolve(env) {
    env.getCounters().incrStmt_For();

    await env.setActiveLine(this.cmdLineNoGia);

    var variable = this.variable;
    var initval = this.initval;
    var finalval = this.finalval;
    var stepval = this.stepval;
    var body = this.body;

    var v_step = 1;

    // step value FOR
    if (stepval != "") {
      if (stepval[0] instanceof Atom.MSymbolTableCell)
        stepval[0] = await stepval[0].eval(env);

      var tmp = await stepval[0].resolve(env);

      if (tmp == null) {
        if (stepval[0] instanceof Atom.MSymbol)
          throw new GE.GError(
            "Το αναγνωριστικό " + stepval[0].name + " δεν έχει αρχικοποιηθεί.",
            this.cmdLineNoGia
          );
        else
          throw new GE.GInternalError(
            "Μη έγκυρη τιμή για το βήμα της εντολής ΓΙΑ.",
            this.cmdLineNoGia
          );
      }

      v_step = tmp.val;
    }

    if (v_step == 0)
      throw new GE.GError(
        "Το βήμα της εντολής ΓΙΑ δεν μπορεί να λάβει την τιμή μηδέν.",
        this.cmdLineNoGia
      );

    // Init value FOR
    if (initval instanceof Atom.MSymbolTableCell)
      initval = await initval.eval(env);

    var tmp = await initval.resolve(env);

    if (tmp == null) {
      if (initval instanceof Atom.MSymbol)
        throw new GE.GError(
          "Το αναγνωριστικό " + initval.name + " δεν έχει αρχικοποιηθεί.",
          this.cmdLineNoGia
        );
      else
        throw new GE.GInternalError(
          "Μη έγκυρη τιμή για την αρχική τιμή της εντολής ΓΙΑ.",
          this.cmdLineNoGia
        );
    }

    var v_initial = tmp.val;

    // final value FOR
    if (finalval instanceof Atom.MSymbolTableCell)
      finalval = await finalval.eval(env);

    var tmp = await finalval.resolve(env);

    if (tmp == null) {
      if (finalval instanceof Atom.MSymbol)
        throw new GE.GError(
          "Το αναγνωριστικό " + finalval.name + " δεν έχει αρχικοποιηθεί.",
          this.cmdLineNoGia
        );
      else
        throw new GE.GInternalError(
          "Μη έγκυρη τιμή για την τελική τιμή της εντολής ΓΙΑ.",
          this.cmdLineNoGia
        );
    }

    var v_final = tmp.val;

    if (variable instanceof Atom.MSymbolTableCell)
      variable = await variable.eval(env);

    env.getScope().setSymbol(variable.name, new Atom.MNumber(v_initial));

    env.postMessage(
      "memorysymbolupdate",
      variable.name,
      HP.formatValueForOutput(
        env.getScope().getSymbol(variable.name).getValue()
      )
    );

    env.getScope().addLock(variable.name);

    while (
      (v_step > 0 &&
        env.getScope().getSymbol(variable.name).getValue() <= v_final) ||
      (v_step < 0 &&
        env.getScope().getSymbol(variable.name).getValue() >= v_final)
    ) {

      env.outputAddDetails(
          "Η συνθήκη " + variable.name + (v_step>0 ? "<=" : ">=") + v_final + " είναι ΑΛΗΘΗΣ",
          this.cmdLineNoGia
        );

      env.getCounters().incrConditionTests();

      await body.resolve(env);

      await env.setActiveLine(this.cmdLineNoTelosEpanalhpshs);

      await env.setActiveLine(this.cmdLineNoGia);

      env.getScope().removeLock(variable.name);

      env
        .getScope()
        .setSymbol(
          variable.name,
          new Atom.MNumber(
            env.getScope().getSymbol(variable.name).getValue() + v_step
          )
        );

      env.postMessage(
        "memorysymbolupdate",
        variable.name,
        HP.formatValueForOutput(
          env.getScope().getSymbol(variable.name).getValue()
        )
      );

      env.getScope().addLock(variable.name);
    }

      env.outputAddDetails(
        "Η συνθήκη " + variable.name + (v_step>0 ? "<=" : ">=") + v_final + " είναι ΨΕΥΔΗΣ",
        this.cmdLineNoGia
      );

    env.getCounters().incrConditionTests();

    env.getScope().removeLock(variable.name);
  }
}

class FunctionCall {
  constructor(fun, args, cmdLineNo) {
    this.fun = fun;
    this.args = args;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(env) {
    env.getCounters().incrFunctionCall();

    env.outputAddDetails(
      "Κλήση της συνάρτησης " + this.fun.name,
      this.cmdLineNo
    );

    if (
      !env.getScope().hasSymbol(this.fun.name) &&
      !(
        env.getScope().getSymbolObject(this.fun.name) instanceof
        STR.STRFunctionMethod
      )
    )
      throw new GE.GError(
        "Η συνάρτηση με όνομα " + this.fun.name + " δεν βρέθηκε.",
        this.cmdLineNo
      );

    var argsResolved = [];
    for (const arg of this.args) {
      var argRes = await arg.resolve(env);
      argsResolved.push(argRes);
    }

    var sendData = [];
    sendData[0] = argsResolved;
    sendData[1] = env.getScope();
    sendData[2] = this.cmdLineNo;

    var fun = env.getScope().getGlobalSymbol(this.fun.name);

    var valReturned = await fun.apply(this, sendData);

    env.postMessage("memory", env.getScope().getMemory());

    env.outputAddDetails(
      "Επιστροφή από την συνάρτηση " +
        this.fun.name +
        " με τιμή επιστροφής " +
        valReturned.val,
      this.cmdLineNo
    );

    return valReturned;
  }
}

class ProcedureCall {
  constructor(fun, args, cmdLineNo) {
    this.fun = fun;
    this.args = args;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(env) {
    env.getCounters().incrProcedureCall();

    await env.setActiveLine(this.cmdLineNo);

    env.outputAddDetails(
      "Κλήση της διαδικασίας " + this.fun.name,
      this.cmdLineNo
    );

    if (
      !env.getScope().hasSymbol(this.fun.name) &&
      !(
        env.getScope().getSymbolObject(this.fun.name) instanceof
        STR.STRProcedureMethod
      )
    )
      throw new GE.GError(
        "Η διαδικασία με όνομα " + this.fun.name + " δεν βρέθηκε.",
        this.cmdLineNo
      );

    var argsResolved = [];
    for (const arg of this.args) {
      var argRes = await arg.resolve(env);
      argsResolved.push(argRes);
    }

    var fun = env.getScope().getGlobalSymbol(this.fun.name);

    var sendData = [];
    sendData[0] = argsResolved;
    sendData[1] = env.getScope();
    sendData[2] = this.cmdLineNo;

    var recvData = await fun.apply(null, sendData);

    env.postMessage("memory", env.getScope().getMemory());

    await env.setActiveLine(this.cmdLineNo);

    env.outputAddDetails(
      "Επιστροφή από την διαδικασία " + this.fun.name,
      this.cmdLineNo
    );

    var procScope = recvData[0];
    var procParams = recvData[1];

    this.args.map(async function (arg, i) {
      if (argsResolved[i] instanceof STR.STRTableName) {
        // Return symbol from arg cell name
        var tblDimensions = env.getScope().getSymbol(arg.name).getSize().length;

        if (tblDimensions == 1) {
          var tblsize1 = env.getScope().getSymbol(arg.name).getSize()[0];
          for (var j = 1; j <= tblsize1; ++j) {
            env
              .getScope()
              .setSymbol(
                arg.name + "[" + j + "]",
                procScope.getSymbol(procParams[i].name + "[" + j + "]")
              );
            env.postMessage(
              "memorysymbolupdate",
              arg.name + "[" + j + "]",
              HP.formatValueForOutput(
                procScope
                  .getSymbol(procParams[i].name + "[" + j + "]")
                  .getValue()
              )
            );
          }
        } else if (tblDimensions == 2) {
          var tblsize1 = env.getScope().getSymbol(arg.name).getSize()[0];
          var tblsize2 = env.getScope().getSymbol(arg.name).getSize()[1];
          for (var j = 1; j <= tblsize1; ++j) {
            for (var l = 1; l <= tblsize2; ++l) {
              env
                .getScope()
                .setSymbol(
                  arg.name + "[" + j + "," + l + "]",
                  procScope.getSymbol(
                    procParams[i].name + "[" + j + "," + l + "]"
                  )
                );
              env.postMessage(
                "memorysymbolupdate",
                arg.name + "[" + j + "," + l + "]",
                HP.formatValueForOutput(
                  procScope
                    .getSymbol(procParams[i].name + "[" + j + "," + l + "]")
                    .getValue()
                )
              );
            }
          }
        }
      } else if (arg instanceof Atom.MSymbolTableCell) {
        arg = await arg.eval(env);

        if (
          env.getScope().getSymbol(arg.name) !=
          procScope.getSymbol(procParams[i].name)
        ) {
          env
            .getScope()
            .setSymbol(arg.name, procScope.getSymbol(procParams[i].name));
          env.postMessage(
            "memorysymbolupdate",
            arg.name,
            HP.formatValueForOutput(
              procScope.getSymbol(procParams[i].name).getValue()
            )
          );
        }
      } else if (arg instanceof Atom.MSymbol) {
        if (
          env.getScope().getSymbol(arg.name) !=
          procScope.getSymbol(procParams[i].name)
        )
          env
            .getScope()
            .setSymbol(arg.name, procScope.getSymbol(procParams[i].name));
        env.postMessage(
          "memorysymbolupdate",
          arg.name,
          HP.formatValueForOutput(
            procScope.getSymbol(procParams[i].name).getValue()
          )
        );
      }
    });
  }
}

class UserFunction {
  constructor(
    name,
    params,
    funType,
    declarations,
    body,
    cmdLineNo,
    cmdLineNoArxi,
    cmdLineNoTelosSynartisis
  ) {
    this.name = name;
    this.params = params;
    this.funType = funType;
    this.declarations = declarations;
    this.body = body;
    this.cmdLineNo = cmdLineNo;
    this.cmdLineNoArxi = cmdLineNoArxi;
    this.cmdLineNoTelosSynartisis = cmdLineNoTelosSynartisis;
  }

  async resolve(env) {
    var name = this.name.name;
    var params = this.params;
    var funType = this.funType;
    var declarations = this.declarations;
    var body = this.body;

    env.getScope().addSymbol(
      name,
      new STR.STRUserFunction(
        async function (...arrargs) {
          env.getCounters().incrUserFunctionCall();

          var scope2 = env.getScope().makeSubScope("Συνάρτηση " + name);

          env.pushScope(scope2);

          // Add function name as variable
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
              throw new GE.GInternalError(
                "Cannot detect function return value type"
              );
          }

          env.getScope().addSymbolFuncName(name, ftype);

          env.postMessage("memory", env.getScope().getMemory());

          await env.setActiveLine(this.cmdLineNo);

          var args = arrargs[0];
          var parentScope = arrargs[1];
          var lineCalled = arrargs[2];

          if (args.length != params.length)
            throw new GE.GError(
              "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης.",
              lineCalled
            );

          await declarations.resolve(env);

          params.forEach(function (param, i) {
            //FIXME:
            if (!env.getScope().hasSymbol(param.name))
              throw new GE.GError(
                "Η παράμετρος " +
                  param.name +
                  "δεν έχει δηλωθεί στο τμήμα δηλώσεων.",
                lineCalled //FIXME: not working
              );

            if (!(args[i] instanceof STR.STRTableName)) {
              env.getScope().setSymbol(param.name, args[i]);
              env.postMessage(
                "memorysymbolupdate",
                param.name,
                HP.formatValueForOutput(args[i].getValue())
              );
            } else {
              if (
                env.getScope().getSymbol(param.name).constructor.name !=
                args[i].constructor.name
              )
                throw new GE.GError(
                  "Η πραγματική παράμετρος είναι διαφορετικού τύπου από την τυπική παράμετρο του υποπρογράμματος." +
                    "\n" +
                    HP.valueTypeToString(scope2.getSymbol(param.name)) + //FIXME:
                    "\n" +
                    HP.valueTypeToString(args[i]),
                  lineCalled
                );

              if (
                !env.getScope().getSymbol(param.name).arraySizeEquals(args[i])
              )
                throw new GE.GError(
                  "Τα όρια της πραγματικής παραμέτρου - πίνακα " +
                    args[i].tblname +
                    " δεν είναι ίδια με της τυπικής παραμέτρου - πίνακα " +
                    param.name,
                  lineCalled
                );

              var tblDimensions = env
                .getScope()
                .getSymbol(param.name)
                .getSize().length;

              if (tblDimensions == 1) {
                var tblsize1 = args[i].getSize()[0];
                for (var k = 1; k <= tblsize1; ++k) {
                  env
                    .getScope()
                    .setSymbol(
                      param.name + "[" + k + "]",
                      parentScope.getSymbol(args[i].tblname + "[" + k + "]")
                    );
                  env.postMessage(
                    "memorysymbolupdate",
                    param.name + "[" + k + "]",
                    HP.formatValueForOutput(
                      parentScope
                        .getSymbol(args[i].tblname + "[" + k + "]")
                        .getValue()
                    )
                  );
                }
              } else if (tblDimensions == 2) {
                var tblsize1 = args[i].getSize()[0];
                var tblsize2 = args[i].getSize()[1];
                for (var k = 1; k <= tblsize1; ++k) {
                  for (var l = 1; l <= tblsize2; ++l) {
                    env
                      .getScope()
                      .setSymbol(
                        param.name + "[" + k + "," + l + "]",
                        parentScope.getSymbol(
                          args[i].tblname + "[" + k + "," + l + "]"
                        )
                      );
                    env.postMessage(
                      "memorysymbolupdate",
                      param.name + "[" + k + "," + l + "]",
                      HP.formatValueForOutput(
                        parentScope
                          .getSymbol(args[i].tblname + "[" + k + "," + l + "]")
                          .getValue()
                      )
                    );
                  }
                }
              }
            }
          });

          await env.setActiveLine(this.cmdLineNoArxi);

          await body.resolve(env);

          await env.setActiveLine(this.cmdLineNoTelosSynartisis);

          if (!env.getScope().getSymbol(name))
            throw new GE.GError(
              "Η συνάρτηση " + name + " δεν επέστρεψε τιμή με το όνομά της.",
              this.cmdLineNoTelosSynartisis
            );

          var returnValue = env.getScope().getSymbol(name);

          env.popScope();

          return returnValue;
        }.bind(this)
      )
    );
  }
}

class UserProcedure {
  constructor(
    name,
    params,
    declarations,
    body,
    cmdLineNo,
    cmdLineNoArxi,
    cmdLineNoTelosDiadikasias
  ) {
    this.name = name;
    this.params = params;
    this.declarations = declarations;
    this.body = body;
    this.cmdLineNo = cmdLineNo;
    this.cmdLineNoArxi = cmdLineNoArxi;
    this.cmdLineNoTelosDiadikasias = cmdLineNoTelosDiadikasias;
  }

  async resolve(env) {
    var name = this.name.name;
    var params = this.params;

    var declarations = this.declarations;
    var body = this.body;

    env.getScope().addSymbol(
      name,
      new STR.STRUserProcedure(
        async function (...arrargs) {
          env.getCounters().incrUserProcedureCall();

          var scope2 = env.getScope().makeSubScope("Διαδικασία " + name);

          env.pushScope(scope2);

          env.postMessage("memory", env.getScope().getMemory());

          await env.setActiveLine(this.cmdLineNo);

          var args = arrargs[0];
          var parentScope = arrargs[1];
          var lineCalled = arrargs[2];

          if (args.length != params.length)
            throw new GE.GError(
              "Λάθος αριθμός παραμέτρων κατά την κλήση της διαδικασίας.",
              lineCalled
            );

          // Declare constants and variables
          await declarations.resolve(env);

          // Sent values to procedure
          params.forEach(function (param, i) {
            if (!env.getScope().hasSymbol(param.name))
              throw new GE.GError(
                "Η παράμετρος " +
                  param.name +
                  " δεν έχει δηλωθεί στο τμήμα δηλώσεων.",
                this.cmdLineNo
              );

            if (!(args[i] instanceof STR.STRTableName)) {
              env.getScope().setSymbol(param.name, args[i]);
              if (args[i] != null)
                env.postMessage(
                  "memorysymbolupdate",
                  param.name,
                  HP.formatValueForOutput(args[i].getValue())
                );
            } else {
              if (
                env.getScope().getSymbol(param.name).constructor.name !=
                args[i].constructor.name
              )
                throw new GE.GError(
                  "Η πραγματική παράμετρος είναι διαφορετικού τύπου από την τυπική παράμετρο του υποπρογράμματος.",
                  lineCalled
                );

              if (
                !env.getScope().getSymbol(param.name).arraySizeEquals(args[i])
              )
                throw new GE.GError(
                  "Οι πίνακες έχουν διαφορετικό μέγεθος.",
                  lineCalled
                );

              var tblDimensions = env
                .getScope()
                .getSymbol(param.name)
                .getSize().length;

              if (tblDimensions == 1) {
                var tblsize1 = args[i].getSize()[0];
                for (var k = 1; k <= tblsize1; ++k) {
                  var newValue = parentScope.getSymbol(
                    args[i].tblname + "[" + k + "]"
                  );
                  env
                    .getScope()
                    .setSymbol(param.name + "[" + k + "]", newValue);
                  if (newValue != null)
                    env.postMessage(
                      "memorysymbolupdate",
                      param.name + "[" + k + "]",
                      HP.formatValueForOutput(newValue.getValue())
                    );
                }
              } else if (tblDimensions == 2) {
                var tblsize1 = args[i].getSize()[0];
                var tblsize2 = args[i].getSize()[1];
                for (var k = 1; k <= tblsize1; ++k) {
                  for (var l = 1; l <= tblsize2; ++l) {
                    var newValue = parentScope.getSymbol(
                      args[i].tblname + "[" + k + "][" + l + "]"
                    );
                    env
                      .getScope()
                      .setSymbol(
                        param.name + "[" + k + "][" + l + "]",
                        newValue
                      );
                    if (newValue != null)
                      env.postMessage(
                        "memorysymbolupdate",
                        param.name + "[" + k + "][" + l + "]",
                        HP.formatValueForOutput(newValue.getValue())
                      );
                  }
                }
              }
            }
          });

          await env.setActiveLine(this.cmdLineNoArxi);

          await body.resolve(env);

          await env.setActiveLine(this.cmdLineNoTelosDiadikasias);

          var returnScope = env.getScope();

          env.popScope();

          var procExecArr = [returnScope, params];

          return procExecArr;
        }.bind(this)
      )
    );
  }
}

class Declaration_Block {
  constructor(constants, variables) {
    this.constants = constants;
    this.variables = variables;
  }
  async resolve(env) {
    if (this.constants[0])
      for (const a of this.constants[0]) {
        await a.resolve(env);
        env.postMessage("memory", env.getScope().getMemory());
      }

    if (this.variables[0])
      for (const a of this.variables[0]) {
        await a.resolve(env);
        env.postMessage("memory", env.getScope().getMemory());
      }

    // Memory initialization completed
    //env.postMessage("memory", env.getScope().getMemory());
  }
}

class DefConstant {
  constructor(sym, val, cmdLineNo) {
    this.sym = sym;
    this.val = val;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(env) {
    await env.setActiveLine(this.cmdLineNo);

    var obj = await this.val.resolve(env);

    if (HP.isInt(obj.val)) var newObj = new STR.STRConstantInt(obj);
    else if (HP.isFloat(obj.val)) var newObj = new STR.STRConstantFloat(obj);
    else if (HP.isString(obj.val)) var newObj = new STR.STRConstantString(obj);
    else if (HP.isBoolean(obj.val))
      var newObj = new STR.STRConstantBoolean(obj);
    else throw new GE.GInternalError("DefConstant(): Unknown constant type");

    env.getScope().addSymbol(this.sym.name, newObj);

    env.getScope().addLock(this.sym.name);
  }
}

class DefVariables {
  constructor(varType, sym, cmdLineNo) {
    this.varType = varType;
    this.sym = sym;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(env) {
    await env.setActiveLine(this.cmdLineNo);

    var varType = this.varType;

    for (const e of this.sym) {
      //this.sym.forEach(function (e) {
      //console.log('======> DefVariables: Create variable symbol name: ', e.name, varType, e);
      //console.log(e.args);
      if (e instanceof Atom.MSymbolTableCell) {
        //console.log('======> DefVariables: Create variable TABLE symbol name: ', e.name, varType);

        var argsResolved = [];
        for (const arg of e.args) {
          //console.log('==> arg: ' + arg);
          var argRes = await arg.resolve(env);
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
        else
          throw new GE.GInternalError("DefVariables(): Unknown variable type");

        // Add to local STR symbol for table name
        env.getScope().addSymbol(e.name, ctype);

        function helperCreateCellFromType(varType) {
          if (varType == "ΑΚΕΡΑΙΕΣ") return new STR.STRTableCellInt(null);
          else if (varType == "ΠΡΑΓΜΑΤΙΚΕΣ")
            return new STR.STRTableCellFloat(null);
          else if (varType == "ΧΑΡΑΚΤΗΡΕΣ")
            return new STR.STRTableCellString(null);
          else if (varType == "ΛΟΓΙΚΕΣ")
            return new STR.STRTableCellBoolean(null);
          else
            throw new GE.GInternalError(
              "DefVariables(): Unknown variable type"
            );
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
            env
              .getScope()
              .addSymbol(
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
              env
                .getScope()
                .addSymbol(
                  e.name + "[" + i + "," + j + "]",
                  helperCreateCellFromType(varType)
                );
            }
          }
        } else
          throw new GE.GError("DefVariables(): Unsupported table dimensions");
      } else {
        if (varType == "ΑΚΕΡΑΙΕΣ") var ctype = new STR.STRVariableInt(null);
        else if (varType == "ΠΡΑΓΜΑΤΙΚΕΣ")
          var ctype = new STR.STRVariableFloat(null);
        else if (varType == "ΧΑΡΑΚΤΗΡΕΣ")
          var ctype = new STR.STRVariableString(null);
        else if (varType == "ΛΟΓΙΚΕΣ")
          var ctype = new STR.STRVariableBoolean(null);
        else
          throw new GE.GInternalError(
            "DefVariables(): Cannot detect variable type"
          );

        env.getScope().addSymbol(e.name, ctype);
      }
    }
  }
}

class Stmt_Block {
  constructor(block) {
    this.block = block;
  }
  async resolve(env) {
    for (const stmt of this.block) await stmt.resolve(env);
  }
}

class MainProgram {
  constructor(
    progname,
    declarations,
    body,
    prognameend,
    cmdLineNoProgramma,
    cmdLineNoArxh,
    cmdLineNoTelosProgrammatos
  ) {
    this.progname = progname;
    this.declarations = declarations;
    this.body = body;
    this.prognameend = prognameend;
    this.cmdLineNoProgramma = cmdLineNoProgramma;
    this.cmdLineNoArxh = cmdLineNoArxh;
    this.cmdLineNoTelosProgrammatos = cmdLineNoTelosProgrammatos;
  }

  async resolve(env) {
    if (
      this.prognameend.length > 0 &&
      this.progname.name != this.prognameend[0].name
    )
      throw new GE.GError(
        "Το όνομα του κυρίως προγράμματος δεν είναι το ίδιο με αυτό που δηλώθηκε αρχικά.",
        this.cmdLineNoTelosProgrammatos
      );

    env.getScope().setScopeTitle("Πρόγραμμα " + this.progname.name);

    env.getScope().addSymbol(this.progname.name, new STR.STRReservedName(null));

    await env.setActiveLine(this.cmdLineNoProgramma);

    await this.declarations.resolve(env);

    await env.setActiveLine(this.cmdLineNoArxh);

    await this.body.resolve(env);

    await env.setActiveLine(this.cmdLineNoTelosProgrammatos);
  }
}

class CommentInlineInput {
  constructor(args) {
    this.args = args;
  }
  async resolve(env) {
    for (const arg of this.args) {
      var argResolved = await arg.resolve(env);
      env.inputAddToBuffer(argResolved.val);
    }
  }
}

class Application {
  constructor(inputdata, program, subprograms) {
    this.inputdata = inputdata;
    this.program = program;
    this.subprograms = subprograms;
  }
  async resolve(env) {
    if (env.inputIsEmptyBuffer())
      for (const a of this.inputdata) await a.resolve(env);

    if (this.subprograms.length)
      for (const a of this.subprograms) await a.resolve(env);

    await this.program.resolve(env);
  }
}

module.exports = {
  Stmt_Assignment,

  Stmt_Write,
  Stmt_Read,

  Stmt_If,
  Stmt_Case,

  Stmt_While,
  Stmt_Do_While,
  Stmt_For,

  Stmt_Block,

  MainProgram,

  Application,

  Declaration_Block,

  DefConstant,
  DefVariables,

  FunctionCall,
  ProcedureCall,

  UserFunction,
  UserProcedure,

  CommentInlineInput,
};
