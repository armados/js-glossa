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
  async resolve(runtimeEnv) {
    await runtimeEnv.setActiveLine(runtimeEnv.getScope(), this.cmdLineNo);

    var sym = this.symbol;

    if (sym instanceof Atom.MSymbolTableCell)
      sym = await sym.eval(runtimeEnv);

    var valResolved = await this.val.resolve(runtimeEnv, runtimeEnv.getScope());

    runtimeEnv.outputAddDetails(
      "Εντολή εκχώρησης: " + this.cmdStrA + " <- " + this.cmdStrB,
      this.cmdLineNo
    );

    runtimeEnv.getScope().setSymbol(sym.name, valResolved);

    runtimeEnv.postMessage(
      "memorysymbolupdate",
      sym.name,
      HP.formatValueForOutput(valResolved.getValue())
    );

    runtimeEnv.incrAssignCounter();
    runtimeEnv.getCounters().incrAssignCounter();
  }
}

class Stmt_Write {
  constructor(args, cmdLineNo) {
    this.args = args;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(runtimeEnv) {
    await runtimeEnv.setActiveLine(runtimeEnv.getScope(), this.cmdLineNo);

    var output = [];

    var prevTypeStringOrBoolean = true;

    for (var i = 0, len = this.args.length; i < len; i++) {
      var argParam = this.args[i];

      if (argParam instanceof Atom.MSymbolTableCell)
        argParam = await argParam.eval(runtimeEnv);

      var arg = await argParam.resolve(runtimeEnv);

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
    runtimeEnv.outputAdd(str);
    runtimeEnv.outputAddDetails("Εμφάνισε στην οθόνη: " + str, this.cmdLineNo);
  }
}

class Stmt_Read {
  constructor(args, cmdLineNo) {
    this.args = args;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(runtimeEnv) {
    await runtimeEnv.setActiveLine(runtimeEnv.getScope(), this.cmdLineNo);

    for (var i = 0, len = this.args.length; i < len; i++) {
      await runtimeEnv.setActiveLineWithoutStep(
        runtimeEnv.getScope(),
        this.cmdLineNo
      );

      var arg = this.args[i];

      if (arg instanceof Atom.MSymbolTableCell)
        arg = await arg.eval(runtimeEnv);

      var data = runtimeEnv.inputFetchValueFromBuffer();

      if (data == null && typeof runtimeEnv.inputFunction === "function") {
        //data = await app["inputFunction"].apply(this, [arg.name]);
        var finishedPromise = false;

        const pro1 = runtimeEnv.inputFunction.apply(this, [arg.name]);

        const pro2 = new Promise(async (resolve, reject) => {
          while (!runtimeEnv.isTerminationFlag() && finishedPromise == false) {
            await runtimeEnv.sleepFunc(100);
          }
          reject("user-interrupt");
        });

        await Promise.race([pro1, pro2])
          .then((response) => {
            data = response;
            finishedPromise = true;
            //console.log("App terminated. Good response: " + response);
          })
          .catch((err) => {
            //console.log("App terminated. Reject response: " + err);
            throw new GE.GInterrupt(
              "Διακοπή της εκτέλεσης του προγράμματος από τον χρήστη.",
              this.cmdLineNo
            );
          });

        if (data != null) {
          if (
            runtimeEnv.getScope().getSymbolObject(arg.name) instanceof
              STR.STRVariableString ||
            runtimeEnv.getScope().getSymbolObject(arg.name) instanceof
              STR.STRTableCellString
          ) {
            data = String(data);
          } else if (
            runtimeEnv.getScope().getSymbolObject(arg.name) instanceof
              STR.STRVariableInt ||
            runtimeEnv.getScope().getSymbolObject(arg.name) instanceof
              STR.STRTableCellInt
          ) {
            if (HP.StringIsNumInt(data)) {
              data = parseInt(data);
            } else {
              data = String(data);
            }
          } else if (
            runtimeEnv.getScope().getSymbolObject(arg.name) instanceof
              STR.STRVariableFloat ||
            runtimeEnv.getScope().getSymbolObject(arg.name) instanceof
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

      runtimeEnv.outputAddDetails(
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

      runtimeEnv.getScope().setSymbol(arg.name, sym);
      runtimeEnv.postMessage(
        "memorysymbolupdate",
        arg.name,
        HP.formatValueForOutput(sym.getValue())
      );

      runtimeEnv.postMessage("inputread", data);
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

  async resolve(runtimeEnv) {
    var arrCond = this.arrCond;
    var arrCondStr = this.arrCondStr;
    var arrLineNo = this.arrLineNo;
    var arrBody = this.arrBody;
    var elseBody = this.elseBody;
    var elseBodyLine = this.elseBodyLine;

    for (var i = 0; i < arrCond.length; ++i) {
      await runtimeEnv.setActiveLine(runtimeEnv.getScope(), this.arrLineNo[i]);

      var condResult = await arrCond[i].resolve(
        runtimeEnv,
        runtimeEnv.getScope()
      );

      if (!(condResult instanceof Atom.MBoolean))
        throw new GE.GError(
          "Η συνθήκη δεν αποτελεί λογική έκφραση." +
            "\n" +
            HP.valueTypeToString(condResult),
          arrLineNo[i]
        );

      runtimeEnv.outputAddDetails(
        "Η συνθήκη " +
          arrCondStr[i] +
          " έχει τιμή " +
          (condResult.val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ"),
        arrLineNo[i]
      );

      runtimeEnv.incrLogicalCounter();

      if (condResult.val == true) {
        await arrBody[i].resolve(runtimeEnv);
        await runtimeEnv.setActiveLine(runtimeEnv.getScope(), this.telosAnLine);
        return;
      }
    }

    if (elseBody != null) {
      await runtimeEnv.setActiveLine(runtimeEnv.getScope(), this.elseBodyLine);
      await elseBody.resolve(runtimeEnv);
      await runtimeEnv.setActiveLine(runtimeEnv.getScope(), this.telosAnLine);
      return;
    }

    await runtimeEnv.setActiveLine(runtimeEnv.getScope(), this.telosAnLine);
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

  async resolve(runtimeEnv) {
    await runtimeEnv.setActiveLine(runtimeEnv.getScope(), this.cmdLineNo);

    var expr = this.expr;
    var arrCond = this.arrCond;
    var arrCondStr = this.arrCondStr;
    var arrLineNo = this.arrLineNo;
    var arrBody = this.arrBody;
    var elseBody = this.elseBody;
    var elseBodyLine = this.elseBodyLine;
    var cmdLineNoTelosEpilogwn = this.cmdLineNoTelosEpilogwn;

    var exprResult = await expr.resolve(runtimeEnv);

    if (exprResult instanceof STR.STRTableName)
      throw new GE.GError(
        "Στην εντολή ΕΠΙΛΕΞΕ επιτρέπονται εκφράσεις όλων των τύπων δεδομένων αλλά όχι πίνακες.",
        this.cmdLineNo
      );

    for (var i = 0; i < arrCond.length; ++i) {
      for (var j = 0; j < arrCond[i].length; ++j) {
        await runtimeEnv.setActiveLine(runtimeEnv.getScope(), arrLineNo[i]);

        var condResult = await arrCond[i][j].resolve(
          runtimeEnv.getScope()
        );

        if (!(condResult instanceof Atom.MBoolean))
          throw new GE.GError(
            "Η συνθήκη δεν αποτελεί λογική έκφραση." +
              "\n" +
              HP.valueTypeToString(condResult),
            arrLineNo[i]
          );

        runtimeEnv.incrLogicalCounter();

        if (condResult.val == true) {
          break;
        }
      }

      runtimeEnv.outputAddDetails(
        "Η περίπτωση " +
          arrCondStr[i] +
          " έχει τιμή " +
          (condResult.val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ"),
        arrLineNo[i]
      );

      if (condResult.val == true) {
        await arrBody[i].resolve(runtimeEnv);
        await runtimeEnv.setActiveLine(
          runtimeEnv.getScope(),
          cmdLineNoTelosEpilogwn
        );
        return;
      }
    }

    if (elseBody != null) {
      await runtimeEnv.setActiveLine(runtimeEnv.getScope(), elseBodyLine);
      await elseBody.resolve(runtimeEnv);
      await runtimeEnv.setActiveLine(
        runtimeEnv.getScope(),
        cmdLineNoTelosEpilogwn
      );
      return;
    }

    await runtimeEnv.setActiveLine(
      runtimeEnv.getScope(),
      cmdLineNoTelosEpilogwn
    );
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
  async resolve(runtimeEnv) {
    while (true) {
      await runtimeEnv.setActiveLine(runtimeEnv.getScope(), this.cmdLineNoOso);

      var condResult = await this.cond.resolve(
        runtimeEnv.getScope()
      );

      if (!(condResult instanceof Atom.MBoolean))
        throw new GE.GError(
          "Η συνθήκη δεν αποτελεί λογική έκφραση." +
            "\n" +
            HP.valueTypeToString(condResult),
          this.cmdLineNoOso
        );

      runtimeEnv.outputAddDetails(
        "Η συνθήκη " +
          this.condstr +
          " έχει τιμή " +
          (condResult.val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ"),
        this.cmdLineNoOso
      );

      runtimeEnv.incrLogicalCounter();

      if (condResult.val == false) break;

      await this.body.resolve(runtimeEnv);

      await runtimeEnv.setActiveLine(
        runtimeEnv.getScope(),
        this.cmdLineNoTelosEpanalhpshs
      );
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
  async resolve(runtimeEnv) {
    do {
      await runtimeEnv.setActiveLine(runtimeEnv.getScope(), this.cmdLineNoArxh);

      await this.body.resolve(runtimeEnv);

      await runtimeEnv
        .getScope()
        .setActiveLine(runtimeEnv.getScope(), this.cmdLineNoMexrisOtou);

      var condResult = await this.cond.resolve(
        runtimeEnv.getScope()
      );

      if (!(condResult instanceof Atom.MBoolean))
        throw new GE.GError(
          "Η συνθήκη δεν αποτελεί λογική έκφραση." +
            "\n" +
            HP.valueTypeToString(condResult),
          this.cmdLineNoMexrisOtou
        );

      runtimeEnv.outputAddDetails(
        "Η συνθήκη " +
          this.condstr +
          " έχει τιμή " +
          (condResult.val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ"),
        this.cmdLineNoMexrisOtou
      );

      runtimeEnv.incrLogicalCounter();
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
  async resolve(runtimeEnv) {
    await runtimeEnv.setActiveLine(runtimeEnv.getScope(), this.cmdLineNoGia);

    var variable = this.variable;
    var initval = this.initval;
    var finalval = this.finalval;
    var stepval = this.stepval;
    var body = this.body;

    var v_step = 1;

    // step value FOR
    if (stepval != "") {
      if (stepval[0] instanceof Atom.MSymbolTableCell)
        stepval[0] = await stepval[0].eval(runtimeEnv);

      var tmp = await stepval[0].resolve(runtimeEnv);

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
      initval = await initval.eval(runtimeEnv);

    var tmp = await initval.resolve(runtimeEnv);

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
      finalval = await finalval.eval(runtimeEnv);

    var tmp = await finalval.resolve(runtimeEnv);

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
      variable = await variable.eval(runtimeEnv);

    runtimeEnv.getScope().setSymbol(variable.name, new Atom.MNumber(v_initial));
    runtimeEnv.postMessage(
      "memorysymbolupdate",
      variable.name,
      HP.formatValueForOutput(new Atom.MNumber(v_initial))
    );
    runtimeEnv.getScope().addLock(variable.name);

    if (v_initial <= v_final && v_step > 0) {
      do {
        runtimeEnv.outputAddDetails(
          "Η συνθήκη " + variable.name + "<=" + v_final + " είναι ΑΛΗΘΗΣ",
          this.cmdLineNoGia
        );

        runtimeEnv.incrLogicalCounter();

        await body.resolve(runtimeEnv);

        await runtimeEnv.setActiveLine(
          runtimeEnv.getScope(),
          this.cmdLineNoTelosEpanalhpshs
        );

        await runtimeEnv.setActiveLine(
          runtimeEnv.getScope(),
          this.cmdLineNoGia
        );

        runtimeEnv.getScope().removeLock(variable.name);

        var newvarvalue = new Atom.MNumber(
          runtimeEnv.getScope().getSymbol(variable.name).val + v_step
        );
        runtimeEnv.getScope().setSymbol(variable.name, newvarvalue);
        runtimeEnv.postMessage(
          "memorysymbolupdate",
          variable.name,
          HP.formatValueForOutput(newvarvalue.getValue())
        );

        runtimeEnv.getScope().addLock(variable.name);
      } while (runtimeEnv.getScope().getSymbol(variable.name).val <= v_final);

      runtimeEnv.outputAddDetails(
        "Η συνθήκη " + variable.name + "<=" + v_final + " είναι ΨΕΥΔΗΣ",
        this.cmdLineNoGia
      );

      runtimeEnv.incrLogicalCounter();
    } else if (v_initial >= v_final && v_step < 0) {
      do {
        runtimeEnv.outputAddDetails(
          "Η συνθήκη " + variable.name + ">=" + v_final + " είναι ΑΛΗΘΗΣ",
          this.cmdLineNoGia
        );

        runtimeEnv.incrLogicalCounter();

        await body.resolve(runtimeEnv);

        await runtimeEnv.setActiveLine(
          runtimeEnv.getScope(),
          this.cmdLineNoTelosEpanalhpshs
        );

        await runtimeEnv.setActiveLine(runtimeEnv.getScope(), this.cmdLineNoGia);

        runtimeEnv.getScope().removeLock(variable.name);

        var newvarvalue = new Atom.MNumber(
          runtimeEnv.getScope().getSymbol(variable.name).val + v_step
        );
        runtimeEnv.getScope().setSymbol(variable.name, newvarvalue);
        runtimeEnv.postMessage(
          "memorysymbolupdate",
          variable.name,
          HP.formatValueForOutput(newvarvalue.getValue())
        );

        runtimeEnv.getScope().addLock(variable.name);
      } while (runtimeEnv.getScope().getSymbol(variable.name).val >= v_final);

      runtimeEnv.outputAddDetails(
        "Η συνθήκη " + variable.name + ">=" + v_final + " είναι ΨΕΥΔΗΣ",
        this.cmdLineNoGia
      );

      runtimeEnv.incrLogicalCounter();
    }

    runtimeEnv.getScope().removeLock(variable.name);
  }
}

class FunctionCall {
  constructor(fun, args, cmdLineNo) {
    this.fun = fun;
    this.args = args;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(runtimeEnv) {
    runtimeEnv.outputAddDetails(
      "Κλήση της Συνάρτησης " + this.fun.name,
      this.cmdLineNo
    );

    if (
      !runtimeEnv.getScope().hasSymbol(this.fun.name) &&
      !(
        runtimeEnv.getScope().getSymbolObject(this.fun.name) instanceof
        STR.STRFunctionMethod
      )
    )
      throw new GE.GError(
        "Η συνάρτηση με όνομα " + this.fun.name + " δεν βρέθηκε.",
        this.cmdLineNo
      );

    var argsResolved = [];
    for (const arg of this.args) {
      var argRes = await arg.resolve(runtimeEnv);
      argsResolved.push(argRes);
    }

    var sendData = [];
    sendData[0] = argsResolved;
    sendData[1] = runtimeEnv;
    sendData[2] = runtimeEnv.getScope();
    sendData[3] = this.cmdLineNo;

    var fun = runtimeEnv.getScope().getGlobalSymbol(this.fun.name);

    var valReturned = await fun.apply(this, sendData);

    runtimeEnv.postMessage("memory", runtimeEnv.getScope().getMemory());

    runtimeEnv.outputAddDetails(
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
  async resolve(runtimeEnv) {
    await runtimeEnv.setActiveLine(runtimeEnv.getScope(), this.cmdLineNo);

    runtimeEnv.outputAddDetails(
      "Κλήση της Διαδικασίας " + this.fun.name,
      this.cmdLineNo
    );

    if (
      !runtimeEnv.getScope().hasSymbol(this.fun.name) &&
      !(
        runtimeEnv.getScope().getSymbolObject(this.fun.name) instanceof
        STR.STRProcedureMethod
      )
    )
      throw new GE.GError(
        "Η διαδικασία με όνομα " + this.fun.name + " δεν βρέθηκε.",
        this.cmdLineNo
      );

    var argsResolved = [];
    for (const arg of this.args) {
      var argRes = await arg.resolve(runtimeEnv);
      argsResolved.push(argRes);
    }

    var fun = runtimeEnv.getScope().getGlobalSymbol(this.fun.name);

    var sendData = [];
    sendData[0] = argsResolved;
    sendData[1] = runtimeEnv;
    sendData[2] = runtimeEnv.getScope();
    sendData[3] = this.cmdLineNo;

    var recvData = await fun.apply(null, sendData);

    runtimeEnv.postMessage("memory", runtimeEnv.getScope().getMemory());

    await runtimeEnv.setActiveLine(runtimeEnv.getScope(), this.cmdLineNo);

    runtimeEnv.outputAddDetails(
      "Επιστροφή από την διαδικασία " + this.fun.name,
      this.cmdLineNo
    );

    var procScope = recvData[0];
    var procParams = recvData[1];

    this.args.map(async function (arg, i) {
      if (argsResolved[i] instanceof STR.STRTableName) {
        // Return symbol from arg cell name
        var tblDimensions = runtimeEnv
          .getScope()
          .getSymbol(arg.name)
          .getSize().length;

        if (tblDimensions == 1) {
          var tblsize1 = runtimeEnv.getScope().getSymbol(arg.name).getSize()[0];
          for (var j = 1; j <= tblsize1; ++j) {
            runtimeEnv
              .getScope()
              .setSymbol(
                arg.name + "[" + j + "]",
                procScope.getSymbol(procParams[i].name + "[" + j + "]")
              );
            runtimeEnv.postMessage(
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
          var tblsize1 = runtimeEnv.getScope().getSymbol(arg.name).getSize()[0];
          var tblsize2 = runtimeEnv.getScope().getSymbol(arg.name).getSize()[1];
          for (var j = 1; j <= tblsize1; ++j) {
            for (var l = 1; l <= tblsize2; ++l) {
              runtimeEnv
                .getScope()
                .setSymbol(
                  arg.name + "[" + j + "," + l + "]",
                  procScope.getSymbol(
                    procParams[i].name + "[" + j + "," + l + "]"
                  )
                );
              runtimeEnv.postMessage(
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
        arg = await arg.eval(runtimeEnv);

        if (
          runtimeEnv.getScope().getSymbol(arg.name) !=
          procScope.getSymbol(procParams[i].name)
        ) {
          runtimeEnv
            .getScope()
            .setSymbol(arg.name, procScope.getSymbol(procParams[i].name));
          runtimeEnv.postMessage(
            "memorysymbolupdate",
            arg.name,
            HP.formatValueForOutput(
              procScope.getSymbol(procParams[i].name).getValue()
            )
          );
        }
      } else if (arg instanceof Atom.MSymbol) {
        if (
          runtimeEnv.getScope().getSymbol(arg.name) !=
          procScope.getSymbol(procParams[i].name)
        )
          runtimeEnv
            .getScope()
            .setSymbol(arg.name, procScope.getSymbol(procParams[i].name));
        runtimeEnv.postMessage(
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
    cmdLineNoTelosSynartisis
  ) {
    this.name = name;
    this.params = params;
    this.funType = funType;
    this.declarations = declarations;
    this.body = body;
    this.cmdLineNo = cmdLineNo;
    this.cmdLineNoTelosSynartisis = cmdLineNoTelosSynartisis;
  }

  async resolve(runtimeEnv) {
    var name = this.name.name;
    var params = this.params;
    var funType = this.funType;
    var declarations = this.declarations;
    var body = this.body;

    runtimeEnv.getScope().addSymbol(
      name,
      new STR.STRUserFunction(
        async function (...arrargs) {
          var scope2 = runtimeEnv.getScope().makeSubScope();
          runtimeEnv.pushScope(scope2);

          var args = arrargs[0];
          var app = arrargs[1];
          var parentScope = arrargs[2];
          var lineCalled = arrargs[3];

          if (args.length != params.length)
            throw new GE.GError(
              "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης.",
              lineCalled
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
              throw new GE.GInternalError(
                "Cannot detect function return value type"
              );
          }

          // Add function name as variable
          runtimeEnv.getScope().addSymbolFuncName(name, ftype);

          await declarations.resolve(runtimeEnv);

          params.forEach(function (param, i) {
            //FIXME:
            if (!runtimeEnv.getScope().hasSymbol(param.name))
              throw new GE.GError(
                "Η παράμετρος " +
                  param.name +
                  "δεν έχει δηλωθεί στο τμήμα δηλώσεων.",
                lineCalled //FIXME: not working
              );

            if (!(args[i] instanceof STR.STRTableName)) {
              runtimeEnv.getScope().setSymbol(param.name, args[i]);
              runtimeEnv.postMessage(
                "memorysymbolupdate",
                param.name,
                HP.formatValueForOutput(args[i].getValue())
              );
            } else {
              if (
                runtimeEnv.getScope().getSymbol(param.name).constructor.name !=
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
                !runtimeEnv
                  .getScope()
                  .getSymbol(param.name)
                  .arraySizeEquals(args[i])
              )
                throw new GE.GError(
                  "Τα όρια της πραγματικής παραμέτρου - πίνακα " +
                    args[i].tblname +
                    " δεν είναι ίδια με της τυπικής παραμέτρου - πίνακα " +
                    param.name,
                  lineCalled
                );

              var tblDimensions = runtimeEnv
                .getScope()
                .getSymbol(param.name)
                .getSize().length;

              if (tblDimensions == 1) {
                var tblsize1 = args[i].getSize()[0];
                for (var k = 1; k <= tblsize1; ++k) {
                  runtimeEnv
                    .getScope()
                    .setSymbol(
                      param.name + "[" + k + "]",
                      parentScope.getSymbol(args[i].tblname + "[" + k + "]")
                    );
                  runtimeEnv.postMessage(
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
                    runtimeEnv
                      .getScope()
                      .setSymbol(
                        param.name + "[" + k + "," + l + "]",
                        parentScope.getSymbol(
                          args[i].tblname + "[" + k + "," + l + "]"
                        )
                      );
                    runtimeEnv.postMessage(
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

          await runtimeEnv.setActiveLine(runtimeEnv.getScope(), this.cmdLineNo);

          await body.resolve(runtimeEnv);

          await runtimeEnv.setActiveLine(
            runtimeEnv.getScope(),
            this.cmdLineNoTelosSynartisis
          );

          if (!runtimeEnv.getScope().getSymbol(name))
            throw new GE.GError(
              "Η συνάρτηση δεν επέστρεψε τιμή με το όνομά της.",
              this.cmdLineNoTelosSynartisis
            );

          var returnValue = runtimeEnv.getScope().getSymbol(name);

          runtimeEnv.popScope();

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
    cmdLineNoTelosDiadikasias
  ) {
    this.name = name;
    this.params = params;
    this.declarations = declarations;
    this.body = body;
    this.cmdLineNo = cmdLineNo;
    this.cmdLineNoTelosDiadikasias = cmdLineNoTelosDiadikasias;
  }

  async resolve(runtimeEnv) {
    var name = this.name.name;
    var params = this.params;

    var declarations = this.declarations;
    var body = this.body;

    runtimeEnv.getScope().addSymbol(
      name,
      new STR.STRUserProcedure(
        async function (...arrargs) {
          var scope2 = runtimeEnv.getScope().makeSubScope();

          runtimeEnv.pushScope(scope2);

          var args = arrargs[0];
          var app = arrargs[1];
          var parentScope = arrargs[2];
          var lineCalled = arrargs[3];

          if (args.length != params.length)
            throw new GE.GError(
              "Λάθος αριθμός παραμέτρων κατά την κλήση της διαδικασίας.",
              lineCalled
            );

          // Declare constants and variables
          await declarations.resolve(runtimeEnv);

          // Sent values to procedure
          params.forEach(function (param, i) {
            if (!runtimeEnv.getScope().hasSymbol(param.name))
              throw new GE.GError(
                "Η παράμετρος " +
                  param.name +
                  " δεν έχει δηλωθεί στο τμήμα δηλώσεων.",
                this.cmdLineNo
              );

            if (!(args[i] instanceof STR.STRTableName)) {
              runtimeEnv.getScope().setSymbol(param.name, args[i]);
              if (args[i] != null)
                runtimeEnv.postMessage(
                  "memorysymbolupdate",
                  param.name,
                  HP.formatValueForOutput(args[i].getValue())
                );
            } else {
              if (
                runtimeEnv.getScope().getSymbol(param.name).constructor.name !=
                args[i].constructor.name
              )
                throw new GE.GError(
                  "Η πραγματική παράμετρος είναι διαφορετικού τύπου από την τυπική παράμετρο του υποπρογράμματος.",
                  lineCalled
                );

              if (
                !runtimeEnv
                  .getScope()
                  .getSymbol(param.name)
                  .arraySizeEquals(args[i])
              )
                throw new GE.GError(
                  "Οι πίνακες έχουν διαφορετικό μέγεθος.",
                  lineCalled
                );

              var tblDimensions = runtimeEnv
                .getScope()
                .getSymbol(param.name)
                .getSize().length;

              if (tblDimensions == 1) {
                var tblsize1 = args[i].getSize()[0];
                for (var k = 1; k <= tblsize1; ++k) {
                  runtimeEnv
                    .getScope()
                    .setSymbol(
                      param.name + "[" + k + "]",
                      parentScope.getSymbol(args[i].tblname + "[" + k + "]")
                    );
                  runtimeEnv.postMessage(
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
                    runtimeEnv
                      .getScope()
                      .setSymbol(
                        param.name + "[" + k + "][" + l + "]",
                        parentScope.getSymbol(
                          args[i].tblname + "[" + k + "][" + l + "]"
                        )
                      );
                    runtimeEnv.postMessage(
                      "memorysymbolupdate",
                      param.name + "[" + k + "][" + l + "]",
                      HP.formatValueForOutput(
                        parentScope
                          .getSymbol(args[i].tblname + "[" + k + "][" + l + "]")
                          .getValue()
                      )
                    );
                  }
                }
              }
            }
          });

          await runtimeEnv.setActiveLine(runtimeEnv.getScope(), this.cmdLineNo);

          await body.resolve(runtimeEnv);

          await runtimeEnv.setActiveLine(
            runtimeEnv.getScope(),
            this.cmdLineNoTelosDiadikasias
          );

          var returnScope = runtimeEnv.getScope();

          runtimeEnv.popScope();

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
  async resolve(runtimeEnv) {
    if (this.constants[0])
      for (const a of this.constants[0]) await a.resolve(runtimeEnv);

    if (this.variables[0])
      for (const a of this.variables[0]) await a.resolve(runtimeEnv);

    runtimeEnv.postMessage("memory", runtimeEnv.getScope().getMemory());
  }
}

class DefConstant {
  constructor(sym, val, cmdLineNo) {
    this.sym = sym;
    this.val = val;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(runtimeEnv) {
    await runtimeEnv.setActiveLine(runtimeEnv.getScope(), this.cmdLineNo);

    var obj = await this.val.resolve(runtimeEnv);

    if (HP.isInt(obj.val)) var newObj = new STR.STRConstantInt(obj);
    else if (HP.isFloat(obj.val)) var newObj = new STR.STRConstantFloat(obj);
    else if (HP.isString(obj.val)) var newObj = new STR.STRConstantString(obj);
    else if (HP.isBoolean(obj.val))
      var newObj = new STR.STRConstantBoolean(obj);
    else throw new GE.GInternalError("Unknown constant type");

    runtimeEnv.getScope().addSymbol(this.sym.name, newObj);

    runtimeEnv.getScope().addLock(this.sym.name);
  }
}

class DefVariables {
  constructor(varType, sym, cmdLineNo) {
    this.varType = varType;
    this.sym = sym;
    this.cmdLineNo = cmdLineNo;
  }
  async resolve(runtimeEnv) {
    await runtimeEnv.setActiveLine(runtimeEnv.getScope(), this.cmdLineNo);

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
          var argRes = await arg.resolve(runtimeEnv);
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
        else throw new GE.GInternalError("Unknown variable type");

        // Add to local STR symbol for table name
        runtimeEnv.getScope().addSymbol(e.name, ctype);

        function helperCreateCellFromType(varType) {
          if (varType == "ΑΚΕΡΑΙΕΣ") return new STR.STRTableCellInt(null);
          else if (varType == "ΠΡΑΓΜΑΤΙΚΕΣ")
            return new STR.STRTableCellFloat(null);
          else if (varType == "ΧΑΡΑΚΤΗΡΕΣ")
            return new STR.STRTableCellString(null);
          else if (varType == "ΛΟΓΙΚΕΣ")
            return new STR.STRTableCellBoolean(null);
          else throw new GE.GInternalError("Unknown variable type");
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
            runtimeEnv
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
              runtimeEnv
                .getScope()
                .addSymbol(
                  e.name + "[" + i + "," + j + "]",
                  helperCreateCellFromType(varType)
                );
            }
          }
        } else throw new GE.GError("Critical: Unsupported table dimensions");
      } else {
        if (varType == "ΑΚΕΡΑΙΕΣ") var ctype = new STR.STRVariableInt(null);
        else if (varType == "ΠΡΑΓΜΑΤΙΚΕΣ")
          var ctype = new STR.STRVariableFloat(null);
        else if (varType == "ΧΑΡΑΚΤΗΡΕΣ")
          var ctype = new STR.STRVariableString(null);
        else if (varType == "ΛΟΓΙΚΕΣ")
          var ctype = new STR.STRVariableBoolean(null);
        else throw new GE.GInternalError("Cannot detect variable type");

        runtimeEnv.getScope().addSymbol(e.name, ctype);
      }
    }
  }
}

class Stmt_Block {
  constructor(block) {
    this.block = block;
  }
  async resolve(runtimeEnv) {
    for (const stmt of this.block) await stmt.resolve(runtimeEnv);
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

  async resolve(runtimeEnv) {
    if (
      this.prognameend.length > 0 &&
      this.progname.name != this.prognameend[0].name
    )
      throw new GE.GError(
        "Το όνομα του κυρίως προγράμματος δεν είναι το ίδιο με αυτό που δηλώθηκε αρχικά.",
        this.cmdLineNoTelosProgrammatos
      );

    runtimeEnv
      .getScope()
      .addSymbol(this.progname.name, new STR.STRReservedName(null));

    await runtimeEnv.setActiveLine(
      runtimeEnv.getScope(),
      this.cmdLineNoProgramma
    );

    await this.declarations.resolve(runtimeEnv);

    await runtimeEnv.setActiveLine(runtimeEnv.getScope(), this.cmdLineNoArxh);

    await this.body.resolve(runtimeEnv);

    await runtimeEnv.setActiveLine(
      runtimeEnv.getScope(),
      this.cmdLineNoTelosProgrammatos
    );
  }
}

class CommentInlineInput {
  constructor(args) {
    this.args = args;
  }
  async resolve(runtimeEnv) {
    for (const arg of this.args) {
      var argResolved = await arg.resolve(runtimeEnv);
      runtimeEnv.inputAddToBuffer(argResolved.val);
    }
  }
}

class Application {
  constructor(inputdata, program, subprograms) {
    this.inputdata = inputdata;
    this.program = program;
    this.subprograms = subprograms;
  }
  async resolve(runtimeEnv) {
    if (runtimeEnv.inputIsEmptyBuffer())
      for (const a of this.inputdata) await a.resolve(runtimeEnv);

    if (this.subprograms.length)
      for (const a of this.subprograms) await a.resolve(runtimeEnv);

    await this.program.resolve(runtimeEnv);
  }
}

module.exports = {
  Stmt_Assignment,

  Stmt_Write,
  Stmt_Read,

  Stmt_If,
  Stmt_Select,

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
