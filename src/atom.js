"use strict";

const GE = require("./gclasses");
const HP = require("./helper");

class Atom {
  constructor(val) {
    this.val = val;
  }
  async resolve(env) {
    return this;
  }
  getValue() {
    return this.val;
  }
}

class MNumber extends Atom {
  constructor(val) {
    super(val);

    if (HP.isFloat(this.val)) 
      this.val = +parseFloat(this.val).toFixed(8);
    
  }
}
class MString extends Atom {}
class MBoolean extends Atom {}

// ===================================

class MathOperation {}

class MathOpPow extends MathOperation {
  constructor(A, B, line = null) {
    super();
    this.A = A;
    this.B = B;
    this.line = line;
  }
  async resolve(env) {
    var a = await this.A.resolve(env);
    var b = await this.B.resolve(env);

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

    if (!HP.isNumber(a.val) || !HP.isNumber(b.val))
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη της ύψωσης σε δύναμη (^) με τα δοθέντα ορίσματα." +
          "\n" +
          HP.valueTypeToString(a) +
          "\n" +
          HP.valueTypeToString(b),
        this.line
      );

    return new MNumber(Math.pow(a.val, b.val));
  }
}

class MathOpMul extends MathOperation {
  constructor(A, B, line = null) {
    super();
    this.A = A;
    this.B = B;
    this.line = line;
  }
  async resolve(env) {
    var a = await this.A.resolve(env);
    var b = await this.B.resolve(env);

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

    if (!HP.isNumber(a.val) || !HP.isNumber(b.val))
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη του πολλαπλασιασμού (*) με τα δοθέντα ορίσματα." +
          "\n" +
          HP.valueTypeToString(a) +
          "\n" +
          HP.valueTypeToString(b),
        this.line
      );

    return new MNumber(a.val * b.val);
  }
}

class MathOpDiv extends MathOperation {
  constructor(A, B, line = null) {
    super();
    this.A = A;
    this.B = B;
    this.line = line;
  }
  async resolve(env) {
    var a = await this.A.resolve(env);
    var b = await this.B.resolve(env);

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

    if (!HP.isNumber(a.val) || !HP.isNumber(b.val))
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη της διαίρεσης (/) με τα δοθέντα ορίσματα." +
          "\n" +
          HP.valueTypeToString(a) +
          "\n" +
          HP.valueTypeToString(b),
        this.line
      );

    if (b.val == 0)
      throw new GE.GError("Η διαίρεση με το μηδέν δεν ορίζεται.", this.line);

    return new MNumber(a.val / b.val);
  }
}

class MathOpDivInt extends MathOperation {
  constructor(A, B, line = null) {
    super();
    this.A = A;
    this.B = B;
    this.line = line;
  }
  async resolve(env) {
    var a = await this.A.resolve(env);
    var b = await this.B.resolve(env);

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

    if (!HP.isInt(a.val) || !HP.isInt(b.val))
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη της ακέραιας διαίρεσης (DIV) με τα δοθέντα ορίσματα." +
          "\n" +
          HP.valueTypeToString(a) +
          "\n" +
          HP.valueTypeToString(b),
        this.line
      );

    if (a.val < 0 || b.val < 0)
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη της ακέραιας διαίρεσης (DIV) με αρνητικές τιμές." +
          "\n" +
          HP.valueTypeToString(a) +
          "\n" +
          HP.valueTypeToString(b),
        this.line
      );

    if (b.val == 0)
      throw new GE.GError("Η διαίρεση με το μηδέν δεν ορίζεται.", this.line);

    return new MNumber(Math.floor(a.val / b.val));
  }
}

class MathOpModInt extends MathOperation {
  constructor(A, B, line = null) {
    super();
    this.A = A;
    this.B = B;
    this.line = line;
  }
  async resolve(env) {
    var a = await this.A.resolve(env);
    var b = await this.B.resolve(env);

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

    if (!HP.isInt(a.val) || !HP.isInt(b.val))
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη της ακέραιας διαίρεσης (MOD) με τα δοθέντα ορίσματα." +
          "\n" +
          HP.valueTypeToString(a) +
          "\n" +
          HP.valueTypeToString(b),
        this.line
      );

    if (a.val < 0 || b.val < 0)
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη της ακέραιας διαίρεσης (MOD) με αρνητικές τιμές." +
          "\n" +
          HP.valueTypeToString(a) +
          "\n" +
          HP.valueTypeToString(b),
        this.line
      );

    if (b.val == 0)
      throw new GE.GError("Η διαίρεση με το μηδέν δεν ορίζεται.", this.line);

    return new MNumber(a.val % b.val);
  }
}

class MathOpAdd extends MathOperation {
  constructor(A, B, line = null) {
    super();
    this.A = A;
    this.B = B;
    this.line = line;
  }
  async resolve(env) {
    var a = await this.A.resolve(env);
    var b = await this.B.resolve(env);

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

    if (!HP.isNumber(a.val) || !HP.isNumber(b.val))
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη της πρόσθεσης (+) με τα δοθέντα ορίσματα." +
          "\n" +
          HP.valueTypeToString(a) +
          "\n" +
          HP.valueTypeToString(b),
        this.line
      );

    return new MNumber(a.val + b.val);
  }
}

class MathOpSub extends MathOperation {
  constructor(A, B, line = null) {
    super();
    this.A = A;
    this.B = B;
    this.line = line;
  }
  async resolve(env) {
    var a = await this.A.resolve(env);
    var b = await this.B.resolve(env);

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

    if (!HP.isNumber(a.val) || !HP.isNumber(b.val))
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη της αφαίρεσης (-) με τα δοθέντα ορίσματα." +
          "\n" +
          HP.valueTypeToString(a) +
          "\n" +
          HP.valueTypeToString(b),
        this.line
      );

    return new MNumber(a.val - b.val);
  }
}

class MathOpRelLt extends MathOperation {
  constructor(A, B, line = null) {
    super();
    this.A = A;
    this.B = B;
    this.line = line;
  }
  async resolve(env) {
    var a = await this.A.resolve(env);
    var b = await this.B.resolve(env);

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
      (HP.isNumber(a.val) && !HP.isNumber(b.val)) ||
      (HP.isString(a.val) && !HP.isString(b.val)) ||
      HP.isBoolean(a.val) ||
      HP.isBoolean(b.val)
    )
      throw new GE.GError(
        "Δεν είναι δυνατή η σύγκριση (<) με τα δοθέντα ορίσματα." +
          "\n" +
          HP.valueTypeToString(a) +
          "\n" +
          HP.valueTypeToString(b),
        this.line
      );

    return new MBoolean(a.val < b.val);
  }
}

class MathOpRelGt extends MathOperation {
  constructor(A, B, line = null) {
    super();
    this.A = A;
    this.B = B;
    this.line = line;
  }
  async resolve(env) {
    var a = await this.A.resolve(env);
    var b = await this.B.resolve(env);

    if (a == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.A.name + " δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (a == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.B.name + " δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (
      (HP.isNumber(a.val) && !HP.isNumber(b.val)) ||
      (HP.isString(a.val) && !HP.isString(b.val)) ||
      HP.isBoolean(a.val) ||
      HP.isBoolean(b.val)
    )
      throw new GE.GError(
        "Δεν είναι δυνατή η σύγκριση (>) με τα δοθέντα ορίσματα. " +
          "\n" +
          HP.valueTypeToString(a) +
          "\n" +
          HP.valueTypeToString(b),
        this.line
      );

    return new MBoolean(a.val > b.val);
  }
}

class MathOpRelLte extends MathOperation {
  constructor(A, B, line = null) {
    super();
    this.A = A;
    this.B = B;
    this.line = line;
  }
  async resolve(env) {
    var a = await this.A.resolve(env);
    var b = await this.B.resolve(env);

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
      (HP.isNumber(a.val) && !HP.isNumber(b.val)) ||
      (HP.isString(a.val) && !HP.isString(b.val)) ||
      HP.isBoolean(a.val) ||
      HP.isBoolean(b.val)
    )
      throw new GE.GError(
        "Δεν είναι δυνατή η σύγκριση (<=) με τα δοθέντα ορίσματα. " +
          "\n" +
          HP.valueTypeToString(a) +
          "\n" +
          HP.valueTypeToString(b),
        this.line
      );

    return new MBoolean(a.val <= b.val);
  }
}

class MathOpRelGte extends MathOperation {
  constructor(A, B, line = null) {
    super();
    this.A = A;
    this.B = B;
    this.line = line;
  }
  async resolve(env) {
    var a = await this.A.resolve(env);
    var b = await this.B.resolve(env);

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
      (HP.isNumber(a.val) && !HP.isNumber(b.val)) ||
      (HP.isString(a.val) && !HP.isString(b.val)) ||
      HP.isBoolean(a.val) ||
      HP.isBoolean(b.val)
    )
      throw new GE.GError(
        "Δεν είναι δυνατή η σύγκριση (>=) με τα δοθέντα ορίσματα. " +
          "\n" +
          HP.valueTypeToString(a) +
          "\n" +
          HP.valueTypeToString(b),
        this.line
      );

    return new MBoolean(a.val >= b.val);
  }
}

class MathOpRelEq extends MathOperation {
  constructor(A, B, line = null) {
    super();
    this.A = A;
    this.B = B;
    this.line = line;
  }
  async resolve(env) {
    var a = await this.A.resolve(env);
    var b = await this.B.resolve(env);

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
      (HP.isNumber(a.val) && !HP.isNumber(b.val)) ||
      (HP.isString(a.val) && !HP.isString(b.val)) ||
      (HP.isBoolean(a.val) && !HP.isBoolean(b.val))
    )
      throw new GE.GError(
        "Δεν είναι δυνατή η σύγκριση (=) με τα δοθέντα ορίσματα." +
          "\n" +
          HP.valueTypeToString(a) +
          "\n" +
          HP.valueTypeToString(b),
        this.line
      );

    return new MBoolean(a.val == b.val);
  }
}

class MathOpRelNeq extends MathOperation {
  constructor(A, B, line = null) {
    super();
    this.A = A;
    this.B = B;
    this.line = line;
  }
  async resolve(env) {
    var a = await this.A.resolve(env);
    var b = await this.B.resolve(env);

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
      (HP.isNumber(a.val) && !HP.isNumber(b.val)) ||
      (HP.isString(a.val) && !HP.isString(b.val)) ||
      (HP.isBoolean(a.val) && !HP.isBoolean(b.val))
    )
      throw new GE.GError(
        "Δεν είναι δυνατή η σύγκριση (<>) με τα δοθέντα ορίσματα." +
          "\n" +
          HP.valueTypeToString(a) +
          "\n" +
          HP.valueTypeToString(b),
        this.line
      );
    return new MBoolean(a.val != b.val);
  }
}

class MathOpLogAnd extends MathOperation {
  constructor(A, B, line = null) {
    super();
    this.A = A;
    this.B = B;
    this.line = line;
  }
  async resolve(env) {
    var a = await this.A.resolve(env);
    var b = await this.B.resolve(env);

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

    if (!HP.isBoolean(a.val) || !HP.isBoolean(b.val))
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη της σύζευξης (ΚΑΙ) με τα δοθέντα ορίσματα." +
          "\n" +
          HP.valueTypeToString(a) +
          "\n" +
          HP.valueTypeToString(b),
        this.line
      );

    return new MBoolean(a.val && b.val);
  }
}

class MathOpLogOr extends MathOperation {
  constructor(A, B, line = null) {
    super();
    this.A = A;
    this.B = B;
    this.line = line;
  }
  async resolve(env) {
    var a = await this.A.resolve(env);
    var b = await this.B.resolve(env);

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

    if (!HP.isBoolean(a.val) || !HP.isBoolean(b.val))
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη της διάζευξης (Η) με τα δοθέντα ορίσματα." +
          "\n" +
          HP.valueTypeToString(a) +
          "\n" +
          HP.valueTypeToString(b),
        this.line
      );

    return new MBoolean(a.val || b.val);
  }
}

class MathOpLogNot extends MathOperation {
  constructor(A, line = null) {
    super();
    this.A = A;
    this.line = line;
  }
  async resolve(env) {
    var a = await this.A.resolve(env);

    if (a.val == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.A.name + " δεν έχει αρχικοποιηθεί.",
        this.line
      );

    if (!HP.isBoolean(a.val))
      throw new GE.GError(
        "Δεν είναι δυνατή η πράξη της άρνησης (ΟΧΙ) με τα δοθέντα ορίσματα." +
          "\n" +
          HP.valueTypeToString(a),
        this.line
      );

    return new MBoolean(!a.val);
  }
}

class MSelectSubrange {
  constructor(A, B, line = null) {
    this.A = A;
    this.B = B;
    this.line = line;
  }
  async resolve(env) {
    var a = await this.A.resolve(env);
    var b = await this.B.resolve(env);

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

    return this;
  }
}

class MSelectExpr {
  constructor(oper, A, line = null) {
    this.oper = oper;
    this.A = A;
    this.line = line;
  }
  async resolve(env) {
    env.getScope().cmdLineNo = this.line; //FIXME:

    var a = await this.A.resolve(env);

    if (a.val == null)
      throw new GE.GError(
        "Το αναγνωριστικό " + this.A.name + " δεν έχει αρχικοποιηθεί.",
        this.line
      );

    return a.val;
  }
}

class MSymbol {
  constructor(name, line = null) {
    this.name = name;
    this.line = line;
  }
  async resolve(env) {
    return env.getScope().getSymbol(this.name);
  }
}

class MSymbolTableCell extends MSymbol {
  constructor(name, args, line = null) {
    super(name, line);
    this.args = args;
  }
  async calcTableIndex(env) {
    var name = this.name;
    var line = this.line;

    var argsResolvedValue = [];
    for (const arg of this.args) {
      var a = await arg.resolve(env);

      if (a == null)
        throw new GE.GError(
          "Το αναγνωριστικό " + arg.name + " δεν έχει αρχικοποιηθεί.",
          line
        );

      if (!HP.isInt(a.val) || a.val <= 0)
        throw new GE.GError(
          "Ο δείκτης του πίνακα " +
            name +
            " πρέπει να είναι θετικός ακέραιος αριθμός." +
            "\n" +
            HP.valueTypeToString(a),
          line
        );

      argsResolvedValue.push(a.val);
    }

    return this.name + "[" + argsResolvedValue.join(",") + "]";
  }

  async eval(env) {
    //scope.cmdLineNo = this.cmdLineNo; //FIXME:

    var name = await this.calcTableIndex(env);

    // Check if symbol exist in scope
    await env.getScope().getSymbol(name);

    return new MSymbol(name);
  }

  async resolve(env) {
    //scope.cmdLineNo = this.cmdLineNo; //FIXME:

    var name = await this.calcTableIndex(env);
    return env.getScope().getSymbol(name);
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
