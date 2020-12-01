"use strict";

const GE = require("./gclasses");

function isFloat(val) {
  return typeof val == "number" && Number(val) === val && val % 1 !== 0;
}
function isInt(val) {
  return typeof val == "number" && Number(val) === val && val % 1 === 0;
}
function isNumber(val) {
  return typeof val == "number" && Number(val) === val;
}
function isString(val) {
  return typeof val == "string";
}
function isBoolean(val) {
  return typeof val == "boolean";
}

function valueTypeToString(val) {
  if (isInt(val)) return "[ " + val + " ] Ακέραια σταθερά";
  else if (isFloat(val)) return "[ " + val + " ] Πραγματική σταθερά";
  else if (isString(val)) return "[ '" + val + "' ] Αλφαριθμητική σταθερά";
  else if (isBoolean(val))
    return "[ " + (val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ") + " ] Λογική σταθερά";
  else throw new GE.GError("Critical: Unknown value type: " + val);
}

class Atom {
  constructor(val) {
    this.val = val;

    if (isFloat(val)) this.val = +parseFloat(val).toFixed(2);
  }
  resolve(scope) {
    return this;
  }
  getValue() {
    return this.val;
  }
}

class MNumber extends Atom {}
class MBoolean extends Atom {}
class MString extends Atom {}

class MathOpPow {
  constructor(A, B, line) {
    this.A = A;
    this.B = B;
    this.line = line;
  }
  resolve(scope) {
    var a = this.A.resolve(scope);
    var b = this.B.resolve(scope);

    if (a == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.A.name + " δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (b == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.B.name + " δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (!isNumber(a.val) || !isNumber(b.val))
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη ^ με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MNumber(Math.pow(a.val, b.val));
  }
}

class MathOpMul {
  constructor(A, B, line) {
    this.A = A;
    this.B = B;
    this.line = line;
  }
  resolve(scope) {
    var a = this.A.resolve(scope);
    var b = this.B.resolve(scope);

    if (a == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.A.name + " δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (b == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.B.name + " δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (!isNumber(a.val) || !isNumber(b.val))
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη * με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MNumber(a.val * b.val);
  }
}

class MathOpDiv {
  constructor(A, B, line) {
    this.A = A;
    this.B = B;
    this.line = line;
  }
  resolve(scope) {
    var a = this.A.resolve(scope);
    var b = this.B.resolve(scope);

    if (a == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.A.name + " δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (b == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.B.name + " δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (!isNumber(a.val) || !isNumber(b.val))
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη / με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    if (b.val == 0)
      throw new GE.GError("Η διαίρεση με το μηδέν δεν ορίζεται.", this.line);

    return new MNumber(a.val / b.val);
  }
}

class MathOpDivInt {
  constructor(A, B, line) {
    this.A = A;
    this.B = B;
    this.line = line;
  }
  resolve(scope) {
    var a = this.A.resolve(scope);
    var b = this.B.resolve(scope);

    if (a == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.A.name + " δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (b == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.B.name + " δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (!isInt(a.val) || !isInt(b.val))
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη DIV με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    if (b.val == 0)
      throw new GE.GError("Η διαίρεση με το μηδέν δεν ορίζεται.", this.line);

    return new MNumber(Math.floor(a.val / b.val));
  }
}

class MathOpModInt {
  constructor(A, B, line) {
    this.A = A;
    this.B = B;
    this.line = line;
  }
  resolve(scope) {
    var a = this.A.resolve(scope);
    var b = this.B.resolve(scope);

    if (a == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.A.name + " δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (b == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.B.name + " δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (!isInt(a.val) || !isInt(b.val))
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη MOD με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    if (b.val == 0)
      throw new GE.GError("Η διαίρεση με το μηδέν δεν ορίζεται.", this.line);

    return new MNumber(a.val % b.val);
  }
}

class MathOpAdd {
  constructor(A, B, line) {
    this.A = A;
    this.B = B;
    this.line = line;
  }
  resolve(scope) {
    var a = this.A.resolve(scope);
    var b = this.B.resolve(scope);

    if (a == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.A.name + " δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (b == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.B.name + " δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (!isNumber(a.val) || !isNumber(b.val))
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη + με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MNumber(a.val + b.val);
  }
}

class MathOpSub {
  constructor(A, B, line) {
    this.A = A;
    this.B = B;
    this.line = line;
  }
  resolve(scope) {
    var a = this.A.resolve(scope);
    var b = this.B.resolve(scope);

    if (a == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.A.name + " δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (b == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.B.name + " δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (!isNumber(a.val) || !isNumber(b.val))
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη - με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MNumber(a.val - b.val);
  }
}

// ========================================

class MathOpRelLt {
  constructor(A, B, line) {
    this.A = A;
    this.B = B;
    this.line = line;
  }
  resolve(scope) {
    var a = this.A.resolve(scope);
    var b = this.B.resolve(scope);

    if (a == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.A.name + " δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (b == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.B.name + " δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (
      (isNumber(a.val) && !isNumber(b.val)) ||
      (isString(a.val) && !isString(b.val)) ||
      isBoolean(a.val) ||
      isBoolean(b.val)
    )
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη < με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MBoolean(a.val < b.val);
  }
}

class MathOpRelGt {
  constructor(A, B, line) {
    this.A = A;
    this.B = B;
    this.line = line;
  }
  resolve(scope) {
    var a = this.A.resolve(scope);
    var b = this.B.resolve(scope);

    if (a == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.A.name + "δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (a == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.B.name + "δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (
      (isNumber(a.val) && !isNumber(b.val)) ||
      (isString(a.val) && !isString(b.val)) ||
      isBoolean(a.val) ||
      isBoolean(b.val)
    )
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη > με τα δοθέντα ορίσματα. " +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MBoolean(a.val > b.val);
  }
}

class MathOpRelLte {
  constructor(A, B, line) {
    this.A = A;
    this.B = B;
    this.line = line;
  }
  resolve(scope) {
    var a = this.A.resolve(scope);
    var b = this.B.resolve(scope);

    if (a == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.A.name + "δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (b == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.B.name + "δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (
      (isNumber(a.val) && !isNumber(b.val)) ||
      (isString(a.val) && !isString(b.val)) ||
      isBoolean(a.val) ||
      isBoolean(b.val)
    )
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη <= με τα δοθέντα ορίσματα. " +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MBoolean(a.val <= b.val);
  }
}

class MathOpRelGte {
  constructor(A, B, line) {
    this.A = A;
    this.B = B;
    this.line = line;
  }
  resolve(scope) {
    var a = this.A.resolve(scope);
    var b = this.B.resolve(scope);

    if (a == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.A.name + "δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (b == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.B.name + "δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (
      (isNumber(a.val) && !isNumber(b.val)) ||
      (isString(a.val) && !isString(b.val)) ||
      isBoolean(a.val) ||
      isBoolean(b.val)
    )
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη >= με τα δοθέντα ορίσματα. " +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MBoolean(a.val >= b.val);
  }
}

class MathOpRelEq {
  constructor(A, B, line) {
    this.A = A;
    this.B = B;
    this.line = line;
  }
  resolve(scope) {
    var a = this.A.resolve(scope);
    var b = this.B.resolve(scope);

    if (a == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.A.name + "δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (b == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.B.name + "δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (
      (isNumber(a.val) && !isNumber(b.val)) ||
      (isString(a.val) && !isString(b.val)) ||
      (isBoolean(a.val) && !isBoolean(b.val))
    )
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη = με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MBoolean(a.val == b.val);
  }
}

class MathOpRelNeq {
  constructor(A, B, line) {
    this.A = A;
    this.B = B;
    this.line = line;
  }
  resolve(scope) {
    var a = this.A.resolve(scope);
    var b = this.B.resolve(scope);

    if (a == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.A.name + "δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (b == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.B.name + "δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (
      (isNumber(a.val) && !isNumber(b.val)) ||
      (isString(a.val) && !isString(b.val)) ||
      (isBoolean(a.val) && !isBoolean(b.val))
    )
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη <> με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );
    return new MBoolean(a.val != b.val);
  }
}

class MathOpLogAnd {
  constructor(A, B, line) {
    this.A = A;
    this.B = B;
    this.line = line;
  }
  resolve(scope) {
    var a = this.A.resolve(scope);
    var b = this.B.resolve(scope);

    if (a == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.A.name + "δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (b == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.B.name + "δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (!isBoolean(a.val) || !isBoolean(b.val))
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη ΚΑΙ με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MBoolean(a.val && b.val);
  }
}

class MathOpLogOr {
  constructor(A, B, line) {
    this.A = A;
    this.B = B;
    this.line = line;
  }
  resolve(scope) {
    var a = this.A.resolve(scope);
    var b = this.B.resolve(scope);

    if (a == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.A.name + "δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (b == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.B.name + "δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (!isBoolean(a.val) || !isBoolean(b.val))
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη Η με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MBoolean(a.val || b.val);
  }
}

class MathOpLogNot {
  constructor(A, line) {
    this.A = A;
    this.line = line;
  }

  resolve(scope) {
    var a = this.A.resolve(scope);

    if (a.val == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.A.name + "δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (!isBoolean(a.val))
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη ΟΧΙ με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val),
        this.line
      );

    return new MBoolean(!a);
  }
}

module.exports = {
  MNumber: MNumber,
  MBoolean: MBoolean,
  MString: MString,
  MathOpPow,
  MathOpMul,
  MathOpDiv,
  MathOpDivInt,
  MathOpModInt,
  MathOpAdd,
  MathOpSub,
  MathOpRelLt,
  MathOpRelGt,
  MathOpRelLte,
  MathOpRelGte,
  MathOpRelEq,
  MathOpRelNeq,
  MathOpLogAnd,
  MathOpLogOr,
  MathOpLogNot,
};
