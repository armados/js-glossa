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
  }
  resolve(scope) {
    return this;
  }
  getValue() {
    return this.val;
  }
}

class MNumber extends Atom {
  constructor(val) {
    super(val);
    if (isFloat(val)) this.val = +parseFloat(val).toFixed(2);
  }
}
class MString extends Atom {}
class MBoolean extends Atom {}

class MathOperation {}

class MathOpPow extends MathOperation {
  constructor(A, B, line) {
    super();
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
        "Δεν είναι δυνατή η πράξη της ύψωσης σε δύναμη (^) με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MNumber(Math.pow(a.val, b.val));
  }
}

class MathOpMul extends MathOperation {
  constructor(A, B, line) {
    super();
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
        "Δεν είναι δυνατή η πράξη του πολλαπλασιασμού (*) με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MNumber(a.val * b.val);
  }
}

class MathOpDiv extends MathOperation {
  constructor(A, B, line) {
    super();
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
        "Δεν είναι δυνατή η πράξη της διαίρεσης (/) με τα δοθέντα ορίσματα." +
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

class MathOpDivInt extends MathOperation {
  constructor(A, B, line) {
    super();
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
        "Δεν είναι δυνατή η πράξη της ακέραιας διαίρεσης (DIV) με τα δοθέντα ορίσματα." +
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

class MathOpModInt extends MathOperation {
  constructor(A, B, line) {
    super();
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
        "Δεν είναι δυνατή η πράξη της ακέραιας διαίρεσης (MOD) με τα δοθέντα ορίσματα." +
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

class MathOpAdd extends MathOperation {
  constructor(A, B, line) {
    super();
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
        "Δεν είναι δυνατή η πράξη της πρόσθεσης (+) με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MNumber(a.val + b.val);
  }
}

class MathOpSub extends MathOperation {
  constructor(A, B, line) {
    super();
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
        "Δεν είναι δυνατή η πράξη της αφαίρεσης (-) με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MNumber(a.val - b.val);
  }
}

class MathOpRelLt extends MathOperation {
  constructor(A, B, line) {
    super();
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
        "Δεν είναι δυνατή η σύγκριση (<) με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MBoolean(a.val < b.val);
  }
}

class MathOpRelGt extends MathOperation {
  constructor(A, B, line) {
    super();
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
        "Δεν είναι δυνατή η σύγκριση (>) με τα δοθέντα ορίσματα. " +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MBoolean(a.val > b.val);
  }
}

class MathOpRelLte extends MathOperation {
  constructor(A, B, line) {
    super();
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
        "Δεν είναι δυνατή η σύγκριση (<=) με τα δοθέντα ορίσματα. " +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MBoolean(a.val <= b.val);
  }
}

class MathOpRelGte extends MathOperation {
  constructor(A, B, line) {
    super();
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
        "Δεν είναι δυνατή η σύγκριση (>=) με τα δοθέντα ορίσματα. " +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MBoolean(a.val >= b.val);
  }
}

class MathOpRelEq extends MathOperation {
  constructor(A, B, line) {
    super();
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
        "Δεν είναι δυνατή η σύγκριση (=) με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MBoolean(a.val == b.val);
  }
}

class MathOpRelNeq extends MathOperation {
  constructor(A, B, line) {
    super();
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
        "Δεν είναι δυνατή η σύγκριση (<>) με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );
    return new MBoolean(a.val != b.val);
  }
}

class MathOpLogAnd extends MathOperation {
  constructor(A, B, line) {
    super();
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
        "Δεν είναι δυνατή η πράξη της σύζευξης (ΚΑΙ) με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MBoolean(a.val && b.val);
  }
}

class MathOpLogOr extends MathOperation {
  constructor(A, B, line) {
    super();
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
        "Δεν είναι δυνατή η πράξη της διάζευξης (Η) με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return new MBoolean(a.val || b.val);
  }
}

class MathOpLogNot extends MathOperation {
  constructor(A, line) {
    super();
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
        "Δεν είναι δυνατή η πράξη της άρνησης (ΟΧΙ) με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val),
        this.line
      );

    return new MBoolean(!a);
  }
}





class MSelectSubrange {
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
        "Δεν είναι δυνατή η πράξη της ακέραιας διαίρεσης (MOD) με τα δοθέντα ορίσματα." +
          "\n" +
          valueTypeToString(a.val) +
          "\n" +
          valueTypeToString(b.val),
        this.line
      );

    return this;
  }
}


class MSelectExpr {
constructor(oper, A, cmdLineNo) {
  this.oper = oper;
  this.A = A;
  this.cmdLineNo = cmdLineNo;
}
resolve(scope) {
  scope.cmdLineNo = this.cmdLineNo; //FIXME:

  var a = this.A.resolve(scope);

  if (a.val == null)
    throw new GE.GError(
      "Το αναγνωριστικό " + this.A.name + "δεν έχει αρχικοποιηθεί.",
      this.line
    );

  console.log('####' + this.oper + ' ' + a.val);

  return a.val;
}
}


class MSymbol {
  constructor(name, cmdLineNo) {
    this.name = name;
    this.cmdLineNo = cmdLineNo;
  }
  resolve(scope) {
    scope.cmdLineNo = this.cmdLineNo; //FIXME:

    return scope.getSymbol(this.name);
  }
}

class MSymbolTableCell extends MSymbol {
  constructor(name, args, cmdLineNo) {
    super(name, cmdLineNo);
    this.args = args;
  }
  calcTableIndex(scope) {
    var argsResolved = this.args.map(function (arg) {
      var a = arg.resolve(scope);

      if (a == null)
        throw new GE.GError(
          "Το αναγνωριστικό " + arg.name + " δεν έχει αρχικοποιηθεί."
        );

      if (!isInt(a.val))
        throw new GE.GError(
          "Ο δείκτης του πίνακα δεν είναι ακέραιος αριθμός." +
            "\n" +
            valueTypeToString(a.val)
        );

      if (a.val <= 0)
        throw new GE.GError(
          "Ο δείκτης του πίνακα δεν είναι θετικός αριθμός. " +
            "\n" +
            valueTypeToString(a.val)
        );

      return a;
    });

    var argsResolvedValue = argsResolved.map(function (arg) {
      return arg.val;
    });

    var name = this.name + "[" + argsResolvedValue.join(",") + "]";

    return name;
  }

  eval(scope) {
    scope.cmdLineNo = this.cmdLineNo; //FIXME:

    var name = this.calcTableIndex(scope);
    return new MSymbol(name);
  }

  resolve(scope) {
    scope.cmdLineNo = this.cmdLineNo; //FIXME:

    var name = this.calcTableIndex(scope);
    return scope.getSymbol(name);
  }
}

module.exports = {
  MNumber,
  MBoolean,
  MString,

  MSelectExpr,
  MSelectSubrange,

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

  MSymbol,
  MSymbolTableCell,
};
