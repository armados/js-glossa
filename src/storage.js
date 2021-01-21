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

class STRFuncNameFloat extends STRFloat {}
class STRFuncNameInt extends STRInt {}
class STRFuncNameString extends STRString {}
class STRFuncNameBoolean extends STRBoolean {}

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
  constructor(parent) {
    this.globalStorage = {};
    this.localStorage = {};
    this.lockedVariables = [];

    this.cmdLineNo = null;

    if (parent) {
      this.globalStorage = parent.globalStorage;
      this.cmdLineNo = parent.cmdLineNo;
    }
  }

  makeSubScope() {
    return new SScope(this);
  }

  isLocked(name) {
    return this.lockedVariables.includes(name);
  }

  addLock(name) {
    if (this.isLocked(name))
      throw new GE.GInternalError("addLock() Symbol already locked " + name);

    this.lockedVariables.push(name);
  }

  removeLock(name) {
    if (!this.isLocked(name))
      throw new GE.GInternalError("removeLock() Symbol not locked " + name);

    const index = this.lockedVariables.indexOf(name);
    this.lockedVariables.splice(index, 1);
  }

  printMemory() {
    console.log("\n============================[ Memory dump  ]");
    console.log("RAM Global storage: ", this.globalStorage);
    console.log("RAM  Local storage: ", this.localStorage);
    console.log("Local Variables Locked: ", this.lockedVariables);
    console.log("\n");
  }

  getMemory() {
    var arr = [];

    for (const [key, value] of Object.entries(this.localStorage)) {
      //ignore tables
      if (value instanceof STRTableName) continue;

      var symType = null;
      var symTypeClass = null;

      if (value instanceof STRInt) {
        symType = "ΑΚΕΡΑΙΑ";
        symTypeClass = "STRInt";
      } else if (value instanceof STRFuncNameInt) {
        symType = "ΑΚΕΡΑΙΑ (όνομα συνάρτησης)";
        symTypeClass = "STRFuncNameInt";
      } else if (value instanceof STRFloat) {
        symType = "ΠΡΑΓΜΑΤΙΚΗ";
        symTypeClass = "STRFloat";
      } else if (value instanceof STRFuncNameFloat) {
        symType = "ΠΡΑΓΜΑΤΙΚΗ (όνομα συνάρτησης)";
        symTypeClass = "STRFuncNameFloat";
      } else if (value instanceof STRString) {
        symType = "ΧΑΡΑΚΤΗΡΑΣ";
        symTypeClass = "STRString";
      } else if (value instanceof STRFuncNameString) {
        symType = "ΧΑΡΑΚΤΗΡΑΣ (όνομα συνάρτησης)";
        symTypeClass = "STRFuncNameString";
      } else if (value instanceof STRBoolean) {
        symType = "ΛΟΓΙΚΗ";
        symTypeClass = "STRBoolean";
      } else if (value instanceof STRFuncNameBoolean) {
        symType = "ΛΟΓΙΚΗ (όνομα συνάρτησης)";
        symTypeClass = "STRFuncNameBoolean";
      } else throw new GE.GInternalError("01 Unknown symbol type" + value);

      var sym = value.get();
      var symValue = sym != null ? sym.val : null;

      if (sym instanceof Atom.MBoolean)
        symValue = sym.getValue() ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ";

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

    throw new GE.GInternalError("Unknown storage type");
  }

  addSymbolFuncName(name, obj) {
    if (obj instanceof STRLocalScope) return (this.localStorage[name] = obj);

    throw new GE.GInternalError("addSymbolFuncName(): Unknown storage type");
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

    var symType = null;

    if (this.getSymbolObject(name) instanceof STRInt) symType = "ΑΚΕΡΑΙΑ";
    else if (this.getSymbolObject(name) instanceof STRFuncNameInt)
      symType = "ΑΚΕΡΑΙΑ (ονομα συνάρτησης)";
    //else if (this.getSymbolObject(name) instanceof STRTableNameInt)
    //  symType = "ΑΚΕΡΑΙΑ (στοιχείο σε πίνακα)";
    else if (this.getSymbolObject(name) instanceof STRFloat)
      symType = "ΠΡΑΓΜΑΤΙΚΗ";
    else if (this.getSymbolObject(name) instanceof STRFuncNameFloat)
      symType = "ΠΡΑΓΜΑΤΙΚΗ (ονομα συνάρτησης)";
    //else if (this.getSymbolObject(name) instanceof STRTableNameFloat)
    //  symType = "ΠΡΑΓΜΑΤΙΚΗ (στοιχείο σε πίνακα)";
    else if (this.getSymbolObject(name) instanceof STRString)
      symType = "ΧΑΡΑΚΤΗΡΑΣ";
    else if (this.getSymbolObject(name) instanceof STRFuncNameString)
      symType = "ΧΑΡΑΚΤΗΡΑΣ (ονομα συνάρτησης)";
    //else if (this.getSymbolObject(name) instanceof STRTableNameString)
    //  symType = "ΧΑΡΑΚΤΗΡΑΣ (στοιχείο σε πίνακα)";
    else if (this.getSymbolObject(name) instanceof STRBoolean)
      symType = "ΛΟΓΙΚΗ";
    else if (this.getSymbolObject(name) instanceof STRFuncNameBoolean)
      symType = "ΛΟΓΙΚΗ (όνομα συνάρτησης)";
    //else if (this.getSymbolObject(name) instanceof STRTableNameBoolean)
    //  symType = "ΛΟΓΙΚΗ (στοιχείο σε πίνακα)";
    else
      throw new GE.GInternalError(
        "01 Unknown symbol type" + this.getSymbol(name)
      );

    //console.log('setSymbol: ', name, symType, ' <--  ',  obj, obj.constructor.name);

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
      "Το αναγνωριστικό " +
        name +
        " δεν βρέθηκε.",
      this.cmdLineNo
    );
  }

  getSymbolObject(name) {
    if (name in this.localStorage) return this.localStorage[name];

    if (name in this.globalStorage) return this.globalStorage[name];

    throw new GE.GError(
      "Το αναγνωριστικό " +
        name +
        " δεν βρέθηκε.",
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
