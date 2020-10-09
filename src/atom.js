"use strict";

var GE = require("./gclasses");


class Atom {
    constructor(val) {
      this.val = val;
  
      if ((typeof(val) == 'number') && 
         (Number(val) === val && val % 1 !== 0))
          this.val = parseFloat(val).toFixed(2);
    }
    resolve(scope) {
      return this;
    }
    jsEquals(jsval) {
      return this.val == jsval;
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
  
      var a;
      var b;
  
      try {
        a = this.A.resolve(scope).val;
      } catch {
        throw new GE.GError("Null value " + this.A.name);
      }
  
      try {
        b = this.B.resolve(scope).val;
      } catch {
        throw new GE.GError("Null value " + this.B.name);
      }
  
      if (this.op == "pow") return new MNumber(Math.pow(a, b));
  
      if (this.op == "mul") return new MNumber(a * b);
  
      if ((this.op == "div" || this.op == "intdiv" || this.op == "intmod") && (b == 0)) 
        throw new GE.GError("Division by zero");

      if (this.op == "div")    return new MNumber(a / b);
      if (this.op == "intdiv") return new MNumber(Math.floor(a / b));
      if (this.op == "intmod") return new MNumber(a % b);
 
      if (this.op == "add") return new MNumber(a + b);
      if (this.op == "sub") return new MNumber(a - b);

      if (this.op == "lt")  return new MBoolean(a < b);
      if (this.op == "gt")  return new MBoolean(a > b); 
      if (this.op == "lte") return new MBoolean(a <= b);
      if (this.op == "gte") return new MBoolean(a >= b);
      if (this.op == "eq")  return new MBoolean(a == b);
      if (this.op == "neq") return new MBoolean(a != b);
  
      if (this.op == "and") return new MBoolean(a && b);
      if (this.op == "or")  return new MBoolean(a || b);
      
    }
  }
  
  class BooleanNotOp {
    constructor(A) {
      this.A = A;
    }
    resolve(scope) {
      //if (this.A instanceof MSymbolTable) { this.A = this.A.resolve(scope); }
  
      var a;
      try {
        a = this.A.resolve(scope).val;
      } catch {
        throw new GE.GError("Null value " + this.A.name);
      }
  
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