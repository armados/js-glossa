"use strict";

const Atom = require("./atom");
const GE = require("./gclasses");
const HP = require("./helper");

class STRScope {
  constructor(obj) {
    this.obj = obj;
  }
  get() {
    return this.obj;
  }
  set(obj) {
    this.obj = obj;
  }
}

class STRGlobalScope extends STRScope {}
class STRLocalScope extends STRScope {}

class STRReservedName extends STRGlobalScope {}

class STRFunctionMethod extends STRGlobalScope {}
class STRProcedureMethod extends STRGlobalScope {}

class STRBuiltinFunction extends STRFunctionMethod {}

class STRUserFunction extends STRFunctionMethod {}
class STRUserProcedure extends STRProcedureMethod {}

class STRNumber extends STRLocalScope {}

class STRFloat extends STRNumber {}
class STRInt extends STRFloat {}
class STRString extends STRLocalScope {}
class STRBoolean extends STRLocalScope {}

class STRVariableFloat extends STRFloat {}
class STRVariableInt extends STRInt {}
class STRVariableString extends STRString {}
class STRVariableBoolean extends STRBoolean {}

class STRTableCellFloat extends STRFloat {}
class STRTableCellInt extends STRInt {}
class STRTableCellString extends STRString {}
class STRTableCellBoolean extends STRBoolean {}

class STRConstantFloat extends STRFloat {}
class STRConstantInt extends STRInt {}
class STRConstantString extends STRString {}
class STRConstantBoolean extends STRBoolean {}

class STRFuncNameFloat extends STRVariableFloat {}
class STRFuncNameInt extends STRVariableInt {}
class STRFuncNameString extends STRVariableString {}
class STRFuncNameBoolean extends STRVariableBoolean {}

class STRTableName {
  constructor(tblname, tblsize) {
    this.tblname = tblname;
    this.tblsize = tblsize;
  }
  get() {
    return this;
  }
  getSize() {
    return this.tblsize;
  }
  arraySizeEquals(anothertable) {
    var a = anothertable.getSize();
    var b = this.getSize();
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index])
    );
  }
}

class STRTableNameFloat extends STRTableName {}
class STRTableNameInt extends STRTableName {}
class STRTableNameString extends STRTableName {}
class STRTableNameBoolean extends STRTableName {}

// ===========================================================

class SScope {
  constructor(parent, title = null) {
    this.title = title;

    this.globalStorage = {};
    this.localStorage = {};
    this.lockedVariables = [];

    this.cmdLineNo = null;

    if (parent) {
      this.globalStorage = parent.globalStorage;
      this.cmdLineNo = parent.cmdLineNo;
    }
  }

  makeSubScope(title) {
    return new SScope(this, title);
  }

  setScopeTitle(title) {
    this.title = title;
  }

  isLocked(name) {
    return this.lockedVariables.includes(name);
  }

  addLock(name) {
    if (this.isLocked(name))
      throw new GE.GInternalError("addLock(): Symbol already locked " + name);

    this.lockedVariables.push(name);
  }

  removeLock(name) {
    if (!this.isLocked(name))
      throw new GE.GInternalError("removeLock(): Symbol not locked " + name);

    const index = this.lockedVariables.indexOf(name);
    this.lockedVariables.splice(index, 1);
  }

  getMemory() {
    var arr = [];

    for (const [key, value] of Object.entries(this.localStorage)) {
      //ignore table name ref
      if (value instanceof STRTableName) continue;

      var symType = null;
      var symTypeClass = null;

      if (value instanceof STRTableCellInt) {
        symType = "ΑΚΕΡΑΙΑ (στοιχείο πίνακα)";
        symTypeClass = "STRTableCellInt";
      } else if (value instanceof STRFuncNameInt) {
        symType = "ΑΚΕΡΑΙΑ (όνομα συνάρτησης)";
        symTypeClass = "STRFuncNameInt";
      } else if (value instanceof STRVariableInt) {
        symType = "ΑΚΕΡΑΙΑ";
        symTypeClass = "STRVariableInt";
      } else if (value instanceof STRConstantInt) {
        symType = "ΑΚΕΡΑΙΑ (σταθερά)";
        symTypeClass = "STRConstantInt";
      } else if (value instanceof STRFuncNameFloat) {
        symType = "ΠΡΑΓΜΑΤΙΚΗ (όνομα συνάρτησης)";
        symTypeClass = "STRFuncNameFloat";
      } else if (value instanceof STRTableCellFloat) {
        symType = "ΠΡΑΓΜΑΤΙΚΗ (στοιχείο πίνακα)";
        symTypeClass = "STRTableCellFloat";
      } else if (value instanceof STRVariableFloat) {
        symType = "ΠΡΑΓΜΑΤΙΚΗ";
        symTypeClass = "STRVariableFloat";
      } else if (value instanceof STRConstantFloat) {
        symType = "ΠΡΑΓΜΑΤΙΚΗ (σταθερά)";
        symTypeClass = "STRConstantFloat";
      } else if (value instanceof STRFuncNameString) {
        symType = "ΧΑΡΑΚΤΗΡΑΣ (όνομα συνάρτησης)";
        symTypeClass = "STRFuncNameString";
      } else if (value instanceof STRTableCellString) {
        symType = "ΧΑΡΑΚΤΗΡΑΣ (στοιχείο πίνακα)";
        symTypeClass = "STRTableCellString";
      } else if (value instanceof STRVariableString) {
        symType = "ΧΑΡΑΚΤΗΡΑΣ";
        symTypeClass = "STRVariableString";
      } else if (value instanceof STRConstantString) {
        symType = "ΧΑΡΑΚΤΗΡΑΣ (σταθερά)";
        symTypeClass = "STRConstantString";
      } else if (value instanceof STRFuncNameBoolean) {
        symType = "ΛΟΓΙΚΗ (όνομα συνάρτησης)";
        symTypeClass = "STRFuncNameBoolean";
      } else if (value instanceof STRTableCellBoolean) {
        symType = "ΛΟΓΙΚΗ (στοιχείο πίνακα)";
        symTypeClass = "STRTableCellBoolean";
      } else if (value instanceof STRVariableBoolean) {
        symType = "ΛΟΓΙΚΗ";
        symTypeClass = "STRVariableBoolean";
      } else if (value instanceof STRConstantBoolean) {
        symType = "ΛΟΓΙΚΗ (σταθερά)";
        symTypeClass = "STRConstantBoolean";
      } else throw new GE.GInternalError("01 Unknown symbol type" + value);

      var sym = value.get();

      if (sym == null) var symValue = null;
      else var symValue = HP.formatValueForOutput(sym.getValue());

      var ret = {
        id: key,
        type: symTypeClass,
        description: symType,
        value: symValue,
      };

      arr.push(ret);
    }

    return arr;
  }

  hasSymbol(name) {
    return name in this.localStorage || name in this.globalStorage;
  }

  addSymbol(name, obj) {
    if (this.hasSymbol(name))
      throw new GE.GError(
        "Το αναγνωριστικό " + name + " έχει ξαναδηλωθεί.",
        this.cmdLineNo
      ); //FIXME:

    if (obj instanceof STRGlobalScope) return (this.globalStorage[name] = obj);

    if (obj instanceof STRLocalScope || obj instanceof STRTableName)
      return (this.localStorage[name] = obj);

    throw new GE.GInternalError("addSymbol(): Unknown storage");
  }

  addSymbolFuncName(name, obj) {
    if (obj instanceof STRLocalScope) return (this.localStorage[name] = obj);

    throw new GE.GInternalError("addSymbolFuncName(): Unknown storage");
  }

  setSymbol(name, obj) {
    if (!this.hasSymbol(name))
      throw new GE.GError(
        "Το αναγνωριστικό " + name + " δεν βρέθηκε στο τμήμα δηλώσεων.",
        this.cmdLineNo
      ); //FIXME:

    if (!obj) return;

    if (this.getSymbolObject(name) instanceof STRTableName)
      throw new GE.GError(
        "Δεν επιτρέπονται αναθέσεις σε ολόκληρο πίνακα.",
        this.cmdLineNo
      );

    if (this.isLocked(name))
      throw new GE.GError(
        "Το αναγνωριστικό " + name + " δεν μπορεί να χρησιμοποιηθεί.",
        this.cmdLineNo
      ); //FIXME:

    if (
      this.getSymbolObject(name) instanceof STRInt ||
      this.getSymbolObject(name) instanceof STRFuncNameInt
    ) {
      if (
        !(obj instanceof STRInt || obj instanceof Atom.MNumber) ||
        !HP.isInt(obj.val)
      )
        throw new GE.GError(
          "Το αναγνωριστικό " +
            name +
            " λαμβάνει μόνο ΑΚΕΡΑΙΕΣ τιμές." +
            "\n" +
            HP.valueTypeToString(obj),
          this.cmdLineNo
        ); //FIXME:
    } else if (
      this.getSymbolObject(name) instanceof STRFloat ||
      this.getSymbolObject(name) instanceof STRFuncNameFloat
    ) {
      if (!(obj instanceof STRFloat || obj instanceof Atom.MNumber))
        throw new GE.GError(
          "Το αναγνωριστικό " +
            name +
            " λαμβάνει μόνο ΠΡΑΓΜΑΤΙΚΕΣ τιμές." +
            "\n" +
            HP.valueTypeToString(obj),
          this.cmdLineNo
        ); //FIXME:
    } else if (
      this.getSymbolObject(name) instanceof STRString ||
      this.getSymbolObject(name) instanceof STRFuncNameString
    ) {
      if (!(obj instanceof STRString || obj instanceof Atom.MString))
        throw new GE.GError(
          "Το αναγνωριστικό " +
            name +
            " λαμβάνει μόνο ΑΛΦΑΡΙΘΜΗΤΙΚΕΣ τιμές." +
            "\n" +
            HP.valueTypeToString(obj),
          this.cmdLineNo
        ); //FIXME:
    } else if (
      this.getSymbolObject(name) instanceof STRBoolean ||
      this.getSymbolObject(name) instanceof STRFuncNameBoolean
    ) {
      if (!(obj instanceof STRBoolean || obj instanceof Atom.MBoolean))
        throw new GE.GError(
          "Το αναγνωριστικό " +
            name +
            " λαμβάνει μόνο ΛΟΓΙΚΕΣ τιμές." +
            "\n" +
            HP.valueTypeToString(obj),
          this.cmdLineNo
        ); //FIXME:
    } else
      throw new GE.GInternalError(
        "02 Unknown symbol type" + this.getSymbol(name)
      );

    this.localStorage[name].set(obj);
  }

  getSymbol(name) {
    if (name in this.localStorage) return this.localStorage[name].get();

    throw new GE.GError(
      "Το αναγνωριστικό " + name + " δεν βρέθηκε.",
      this.cmdLineNo
    );
  }

  getGlobalSymbol(name) {
    if (name in this.globalStorage) return this.globalStorage[name].get();

    throw new GE.GError(
      "Το αναγνωριστικό " + name + " δεν βρέθηκε.",
      this.cmdLineNo
    );
  }

  getSymbolObject(name) {
    if (name in this.localStorage) return this.localStorage[name];

    if (name in this.globalStorage) return this.globalStorage[name];

    throw new GE.GError(
      "Το αναγνωριστικό " + name + " δεν βρέθηκε.",
      this.cmdLineNo
    );
  }
}

module.exports = {
  STRReservedName,

  STRFunctionMethod,
  STRProcedureMethod,

  STRBuiltinFunction,

  STRUserFunction,
  STRUserProcedure,

  STRNumber,
  STRFloat,
  STRInt,
  STRString,
  STRBoolean,

  STRVariableFloat,
  STRVariableInt,
  STRVariableString,
  STRVariableBoolean,

  STRTableCellFloat,
  STRTableCellInt,
  STRTableCellString,
  STRTableCellBoolean,

  STRConstantFloat,
  STRConstantInt,
  STRConstantString,
  STRConstantBoolean,

  SScope,

  STRFuncNameFloat,
  STRFuncNameInt,
  STRFuncNameString,
  STRFuncNameBoolean,

  STRTableName,

  STRTableNameFloat,
  STRTableNameInt,
  STRTableNameString,
  STRTableNameBoolean,
};
