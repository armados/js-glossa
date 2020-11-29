"use strict";

const GE = require("./gclasses");

class Atom {
    constructor(val) {
      this.val = val;
  
      if ((typeof(val) == 'number') && 
         (Number(val) === val && val % 1 !== 0))
          this.val = +parseFloat(val).toFixed(2);
    }
    resolve(scope) {
      return this;
    }
    getValue() {
      return this.val;
    }
  }
  
  class MNumber  extends Atom {}
  class MBoolean extends Atom {}
  class MString  extends Atom {}
  
  class BinaryOp {
    constructor(op, A, B) {
      this.op = op;
      this.A = A;
      this.B = B;
    }
    resolve(scope) {
      if (this.A.resolve(scope) == null)
        throw new GE.GError('Το αναγνωριστικό ' + this.A.name + 'δεν έχει αρχικοποιηθεί.');

      if (this.B.resolve(scope) == null)
        throw new GE.GError('Το αναγνωριστικό ' + this.B.name + 'δεν έχει αρχικοποιηθεί.');

      var a = this.A.resolve(scope).val;
      var b = this.B.resolve(scope).val;
  
      if (this.op == "pow")    return new MNumber(Math.pow(a, b));
  
      if (this.op == "mul")    return new MNumber(a * b);
  
      if ((this.op == "div" || this.op == "intdiv" || this.op == "intmod") && (b == 0)) 
        throw new GE.GError('Η διαίρεση με το μηδέν δεν ορίζεται.');

      if (this.op == "div")    return new MNumber(a / b);
      if (this.op == "intdiv") return new MNumber(Math.floor(a / b));
      if (this.op == "intmod") return new MNumber(a % b);
 
      if (this.op == "add")    return new MNumber(a + b);
      if (this.op == "sub")    return new MNumber(a - b);

      if (this.op == "lt")     return new MBoolean(a < b);
      if (this.op == "gt")     return new MBoolean(a > b); 
      if (this.op == "lte")    return new MBoolean(a <= b);
      if (this.op == "gte")    return new MBoolean(a >= b);
      if (this.op == "eq")     return new MBoolean(a == b);
      if (this.op == "neq")    return new MBoolean(a != b);
  
      if (this.op == "and")    return new MBoolean(a && b);
      if (this.op == "or")     return new MBoolean(a || b);  
    }
  }
  
  class BooleanNotOp {
    constructor(A) {
      this.A = A;
    }
    resolve(scope) {

      if (this.A.resolve(scope) == null)
        throw new GE.GError('Το αναγνωριστικό ' + this.A.name + 'δεν έχει αρχικοποιηθεί.');

      var a = this.A.resolve(scope).val;
  
      return new MBoolean(!a);
    }
  }

module.exports = {
    MNumber: MNumber,
    MBoolean: MBoolean,
    MString: MString,
  
    BinaryOp: BinaryOp,
    BooleanNotOp: BooleanNotOp,
}