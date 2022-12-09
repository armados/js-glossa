const MO = require("./objects");
const Atom = require("./atom");

function getLineNo(cmd) {
  var scode = cmd.source.sourceString;
  var endChar = cmd.source.startIdx;
  var res = scode.substring(0, endChar);
  var lineNo = res.split(/\r\n|\r|\n/).length;
  return lineNo;
}

var operation = {
  floatlit: function (a, _, b) {
    return new Atom.MNumber(parseFloat(this.sourceString, 10));
  },
  intlit: function (a) {
    return new Atom.MNumber(parseInt(this.sourceString, 10));
  },
  strlit: function (_1, a, _2) {
    return new Atom.MString(a.sourceString);
  },
  true: function (a) {
    return new Atom.MBoolean(true);
  },
  false: function (a) {
    return new Atom.MBoolean(false);
  },

  PriExp_parens: function (_1, a, _2) {
    return a.toAST();
  },

  ExpExp_powop: function (a, _, b) {
    return new Atom.MathOpPow(a.toAST(), b.toAST(), getLineNo(a));
  },

  MulExp_mul: function (a, _, b) {
    return new Atom.MathOpMul(a.toAST(), b.toAST(), getLineNo(a));
  },
  MulExp_div: function (a, _, b) {
    return new Atom.MathOpDiv(a.toAST(), b.toAST(), getLineNo(a));
  },
  MulExp_intdiv: function (a, _, b) {
    return new Atom.MathOpDivInt(a.toAST(), b.toAST(), getLineNo(a));
  },
  MulExp_intmod: function (a, _, b) {
    return new Atom.MathOpModInt(a.toAST(), b.toAST(), getLineNo(a));
  },

  AddExp_add: function (a, _, b) {
    return new Atom.MathOpAdd(a.toAST(), b.toAST(), getLineNo(a));
  },
  AddExp_sub: function (a, _, b) {
    return new Atom.MathOpSub(a.toAST(), b.toAST(), getLineNo(a));
  },

  ExpRel_lt: function (a, _, b) {
    return new Atom.MathOpRelLt(a.toAST(), b.toAST(), getLineNo(a));
  },
  ExpRel_gt: function (a, _, b) {
    return new Atom.MathOpRelGt(a.toAST(), b.toAST(), getLineNo(a));
  },
  ExpRel_lte: function (a, _, b) {
    return new Atom.MathOpRelLte(a.toAST(), b.toAST(), getLineNo(a));
  },
  ExpRel_gte: function (a, _, b) {
    return new Atom.MathOpRelGte(a.toAST(), b.toAST(), getLineNo(a));
  },
  ExpRel_eq: function (a, _, b) {
    return new Atom.MathOpRelEq(a.toAST(), b.toAST(), getLineNo(a));
  },
  ExpRel_neq: function (a, _, b) {
    return new Atom.MathOpRelNeq(a.toAST(), b.toAST(), getLineNo(a));
  },

  PriExp_not: function (_, a) {
    return new Atom.MathOpLogNot(a.toAST(), getLineNo(a));
  },

  ExpAnd_andop: function (a, _, b) {
    return new Atom.MathOpLogAnd(a.toAST(), b.toAST(), getLineNo(a));
  },
  ExpOr_orop: function (a, _, b) {
    return new Atom.MathOpLogOr(a.toAST(), b.toAST(), getLineNo(a));
  },

  PriExp_pos: function (_, a) {
    return a.toAST();
  },
  PriExp_neg: function (_, a) {
    return new Atom.MathOpMul(a.toAST(), new Atom.MNumber(-1), getLineNo(a));
  },

  AssignExpr: function (a, _, b) {
    return new MO.Stmt_Assignment(
      a.toAST(),
      b.toAST(),
      a.sourceString,
      b.sourceString,
      getLineNo(a)
    );
  },

  CommentInlineInput: function (_1, a, _nl) {
    return new MO.CommentInlineInput(a.toAST());
  },

  id: function (a, b) {
    return new Atom.MSymbol(this.sourceString, getLineNo(a));
  },
  IdTbl: function (a, _1, b, _2) {
    return new Atom.MSymbolTableCell(a.sourceString, b.toAST(), getLineNo(a));
  },

  // Normal block
  IfExpr: function (
    _1,
    cond,
    _2,
    _nl0,
    tb,
    _AlliosAn,
    condElseIf,
    _Tote,
    _nl1,
    blockElseIf,
    _Allios,
    _nl2,
    eb,
    _TelosAn
  ) {
    var arrCond = [];
    var arrCondStr = [];
    var arrLineNo = [];
    var arrBody = [];

    arrCond.push(cond.toAST());
    arrCondStr.push(cond.sourceString);
    arrLineNo.push(getLineNo(cond));
    arrBody.push(tb.toAST());

    if (condElseIf.numChildren) {
      //console.log(blockElseIf.children);
      var moreBody = blockElseIf.toAST();
      for (var i = 0, len = condElseIf.numChildren; i < len; i++) {
        var cond2 = condElseIf.children[i];

        arrCond.push(cond2.toAST());
        arrCondStr.push(cond2.sourceString);
        arrLineNo.push(getLineNo(cond2));
        arrBody.push(moreBody[i]);
      }
    }

    var elseBody = eb ? eb.toAST()[0] : null;
    return new MO.Stmt_If(
      arrCond,
      arrCondStr,
      arrLineNo,
      arrBody,
      elseBody,
      getLineNo(_Allios),
      getLineNo(_TelosAn)
    );
  },

  WhileExpr: function (_OSO, cond, _EPANALAVE, _nl, body, _TELOS_EPANALHPSHS) {
    return new MO.Stmt_While(
      cond.toAST(),
      cond.sourceString,
      body.toAST(),
      getLineNo(_OSO),
      getLineNo(_TELOS_EPANALHPSHS)
    );
  },

  DoWhileExpr: function (_ARXH_EPANALHPSHS, _nl, body, _MEXRIS_OTOU, cond) {
    return new MO.Stmt_Do_While(
      cond.toAST(),
      cond.sourceString,
      body.toAST(),
      getLineNo(_ARXH_EPANALHPSHS),
      getLineNo(_MEXRIS_OTOU)
    );
  },

  ForExpr: function (
    _GIA,
    variable,
    _APO,
    initval,
    _MEXRI,
    finalval,
    _ME_BHMA,
    stepval,
    _nl,
    body,
    _TELOS_EPANALHPSHS
  ) {
    return new MO.Stmt_For(
      variable.toAST(),
      initval.toAST(),
      finalval.toAST(),
      stepval.toAST(),
      body.toAST(),
      getLineNo(_GIA),
      getLineNo(_TELOS_EPANALHPSHS)
    );
  },

  Subrange: function (a, _1, b) {
    return new Atom.MSelectSubrange(a.toAST(), b.toAST(), getLineNo(a));
  },
  SelectExpr: function (a, b) {
    return new Atom.MSelectExpr(a.sourceString, b.toAST(), getLineNo(a));
  },

  Stmt_Case: function (
    _EPILEXE,
    expr,
    _nl0,
    _PERIPTOSH,
    exprcase,
    _nl1,
    exprbody,
    _PERIPTOSH2,
    _ALLIOS,
    _nl2,
    eb,
    _TELOS_EPILOGON
  ) {
    var arrCond = [];
    var arrCondStr = [];
    var arrLineNo = [];
    var arrBody = [];

    var aAst = expr.toAST();

    if (exprcase.numChildren) {
      //console.log(blockElseIf.children);
      var moreBody = exprbody.toAST();
      for (var i = 0, len1 = exprcase.numChildren; i < len1; i++) {
        var cond2 = exprcase.children[i];
        //console.log(cond2.toAST());
        //console.log("==========================");

        var cond2ast = cond2.toAST();
        var line = getLineNo(cond2);

        var newcond2 = [];
        for (var j = 0, len2 = cond2ast.length; j < len2; j++) {
          if (cond2ast[j] instanceof Atom.MSelectSubrange) {
            //console.log('is MSelectSubrange');
            var newcondL = new Atom.MathOpRelGte(aAst, cond2ast[j].A, line);
            var newcondR = new Atom.MathOpRelLte(aAst, cond2ast[j].B, line);
            var newcond = new Atom.MathOpLogAnd(newcondL, newcondR, line);
            // console.log(newcond);
          } else if (cond2ast[j] instanceof Atom.MSelectExpr) {
            //console.log('is MSelectExpr');

            switch (cond2ast[j].oper) {
              case "<":
                var newcond = new Atom.MathOpRelLt(aAst, cond2ast[j].A, line);
                break;
              case "<=":
                var newcond = new Atom.MathOpRelLte(aAst, cond2ast[j].A, line);
                break;
              case ">":
                var newcond = new Atom.MathOpRelGt(aAst, cond2ast[j].A, line);
                break;
              case ">=":
                var newcond = new Atom.MathOpRelGte(aAst, cond2ast[j].A, line);
                break;
              case "=":
                var newcond = new Atom.MathOpRelEq(aAst, cond2ast[j].A, line);
                break;
              case "<>":
                var newcond = new Atom.MathOpRelNeq(aAst, cond2ast[j].A, line);
                break;
              default:
                throw new Error("Missing Rel Operation??");
            }

            console.log(newcond);
          } else {
            var newcond = new Atom.MathOpRelEq(aAst, cond2ast[j], line);
          }

          newcond2.push(newcond);
        }

        arrCond.push(newcond2);
        arrCondStr.push(cond2.sourceString);
        arrLineNo.push(getLineNo(cond2));
        arrBody.push(moreBody[i]);
      }
    }

    //console.log(arrCond);

    var elseBody = eb ? eb.toAST()[0] : null;
    return new MO.Stmt_Case(
      aAst,
      arrCond,
      arrCondStr,
      arrLineNo,
      arrBody,
      elseBody,
      getLineNo(expr),
      getLineNo(_ALLIOS),
      getLineNo(_TELOS_EPILOGON)
    );
  },

  FunctionCall: function (a, _1, b, _2) {
    return new MO.FunctionCall(a.toAST(), b.toAST(), getLineNo(a));
  },
  ProcedureCall: function (_1, a, _2, b, _3) {
    var params = b.toAST();
    if (params.length > 0) params = params[0];
    return new MO.ProcedureCall(a.toAST(), params, getLineNo(a));
  },

  Arguments: function (a) {
    return a.asIteration().toAST();
  },
  AtLeastOneArguments: function (a) {
    return a.asIteration().toAST();
  },
  AtLeastOneLit: function (a) {
    return a.asIteration().toAST();
  },
  AtLeastOneParameters: function (a) {
    return a.asIteration().toAST();
  },
  Parameters: function (a) {
    return a.asIteration().toAST();
  },

  VarParameters: function (a) {
    return a.asIteration().toAST();
  },

  AtLeastOneSelectCase: function (a) {
    return a.asIteration().toAST();
  },

  Application: function (_nl0, keyboardData, mainProg, subPrograms) {
    return new MO.Application(
      keyboardData.toAST(),
      mainProg.toAST(),
      subPrograms.toAST()
    );
  },

  MainProgram: function (
    _PROGRAMMA,
    name,
    _nl0,
    decl,
    _ARXH,
    _nl1,
    mBlock,
    _TELOS_PROGRAMMATOS,
    nameend,
    _nl2
  ) {
    return new MO.MainProgram(
      name.toAST(),
      decl.toAST(),
      mBlock.toAST(),
      nameend.toAST(),
      getLineNo(_PROGRAMMA),
      getLineNo(_ARXH),
      getLineNo(_TELOS_PROGRAMMATOS)
    );
  },

  UserFunction: function (
    _1,
    name,
    _2,
    params,
    _3,
    _4,
    funType,
    _nl0,
    decl,
    _Arxi,
    _nl1,
    mBlock,
    _TelosSynartisis,
    _nl2
  ) {
    return new MO.UserFunction(
      name.toAST(),
      params.toAST(),
      funType.sourceString,
      decl.toAST(),
      mBlock.toAST(),
      getLineNo(name),
      getLineNo(_Arxi),
      getLineNo(_TelosSynartisis)
    );
  },

  UserProcedure: function (
    _1,
    name,
    _2,
    b,
    _3,
    _nl0,
    decl,
    _Arxi,
    _nl1,
    mBlock,
    _TelosDiadikasias,
    _nl2
  ) {
    var params = b.toAST();
    if (params.length > 0) params = params[0];
    return new MO.UserProcedure(
      name.toAST(),
      params,
      decl.toAST(),
      mBlock.toAST(),
      getLineNo(name),
      getLineNo(_Arxi),
      getLineNo(_TelosDiadikasias)
    );
  },

  Declaration_Block: function (_1, _nl0, statheres, _2, _nl1, metavlites) {
    return new MO.Declaration_Block(statheres.toAST(), metavlites.toAST());
  },

  DefConstant: function (a, _, b, _nl) {
    return new MO.DefConstant(a.toAST(), b.toAST(), getLineNo(a));
  },

  DefVariables: function (a, _, b, _nl) {
    return new MO.DefVariables(a.sourceString, b.toAST(), getLineNo(a));
  },

  Block: function (a, _nl) {
    return new MO.Stmt_Block(a.toAST());
  },

  Stmt_Write: function (_, a) {
    return new MO.Stmt_Write(a.toAST(), getLineNo(a));
  },
  Stmt_Read: function (_, a) {
    return new MO.Stmt_Read(a.toAST(), getLineNo(a));
  },
};

module.exports = {
  load: function (gram) {
    return gram.createSemantics().addOperation("toAST", operation);
  },
};
