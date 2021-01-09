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

  Exp7_parens: function (_1, a, _2) {
    return a.toAST();
  },

  Exp5_powop: function (a, _, b) {
    return new Atom.MathOpPow(a.toAST(), b.toAST(), getLineNo(a));
  },

  Exp4_mul: function (a, _, b) {
    return new Atom.MathOpMul(a.toAST(), b.toAST(), getLineNo(a));
  },
  Exp4_div: function (a, _, b) {
    return new Atom.MathOpDiv(a.toAST(), b.toAST(), getLineNo(a));
  },

  Exp4_intdiv: function (a, _, b) {
    return new Atom.MathOpDivInt(a.toAST(), b.toAST(), getLineNo(a));
  },
  Exp4_intmod: function (a, _, b) {
    return new Atom.MathOpModInt(a.toAST(), b.toAST(), getLineNo(a));
  },

  Exp3_add: function (a, _, b) {
    return new Atom.MathOpAdd(a.toAST(), b.toAST(), getLineNo(a));
  },
  Exp3_sub: function (a, _, b) {
    return new Atom.MathOpSub(a.toAST(), b.toAST(), getLineNo(a));
  },

  Exp2_lt: function (a, _, b) {
    return new Atom.MathOpRelLt(a.toAST(), b.toAST(), getLineNo(a));
  },
  Exp2_gt: function (a, _, b) {
    return new Atom.MathOpRelGt(a.toAST(), b.toAST(), getLineNo(a));
  },
  Exp2_lte: function (a, _, b) {
    return new Atom.MathOpRelLte(a.toAST(), b.toAST(), getLineNo(a));
  },
  Exp2_gte: function (a, _, b) {
    return new Atom.MathOpRelGte(a.toAST(), b.toAST(), getLineNo(a));
  },
  Exp2_eq: function (a, _, b) {
    return new Atom.MathOpRelEq(a.toAST(), b.toAST(), getLineNo(a));
  },
  Exp2_neq: function (a, _, b) {
    return new Atom.MathOpRelNeq(a.toAST(), b.toAST(), getLineNo(a));
  },

  Exp6_not: function (_, a) {
    return new Atom.MathOpLogNot(a.toAST(), getLineNo(a));
  },
  Exp1_andop: function (a, _, b) {
    return new Atom.MathOpLogAnd(a.toAST(), b.toAST(), getLineNo(a));
  },
  Exp_orop: function (a, _, b) {
    return new Atom.MathOpLogOr(a.toAST(), b.toAST(), getLineNo(a));
  },

  Exp6_neq: function (_, a) {
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

  KeyboardData: function (_1, a) {
    return new MO.InlineKeyboardInput(a.toAST());
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
    tb,
    _AlliosAn,
    condElseIf,
    _Tote,
    blockElseIf,
    _Allios,
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
    return new MO.Stmt_IfCond(
      arrCond,
      arrCondStr,
      arrLineNo,
      arrBody,
      elseBody,
      getLineNo(_Allios),
      getLineNo(_TelosAn)
    );
  },

  WhileExpr: function (_OSO, cond, _EPANALAVE, body, _TELOS_EPANALHPSHS) {
    return new MO.Stmt_WhileLoop(
      cond.toAST(),
      cond.sourceString,
      body.toAST(),
      getLineNo(_OSO),
      getLineNo(_TELOS_EPANALHPSHS)
    );
  },

  DoWhileExpr: function (_ARXH_EPANALHPSHS, body, _MEXRIS_OTOU, cond) {
    return new MO.Stmt_Do_WhileLoop(
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
    return new MO.Stmt_ForLoop(
      variable.toAST(),
      initval.toAST(),
      finalval.toAST(),
      stepval.toAST(),
      body.toAST(),
      getLineNo(_GIA),
      getLineNo(_TELOS_EPANALHPSHS)
    );
  },

  // Function block
  IfExprFunction: function (
    _1,
    cond,
    _2,
    tb,
    _AlliosAn,
    condElseIf,
    _Tote,
    blockElseIf,
    _Allios,
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
    return new MO.Stmt_IfCond(
      arrCond,
      arrCondStr,
      arrLineNo,
      arrBody,
      elseBody,
      getLineNo(_Allios),
      getLineNo(_TelosAn)
    );
  },

  Subrange: function (a, _1, b) {
    return new Atom.MSelectSubrange(a.toAST(), b.toAST(), getLineNo(a));
  },
  SelectExpr: function (a, b) {
    return new Atom.MSelectExpr(a.sourceString, b.toAST(), getLineNo(a));
  },

  Stmt_Select: function (_EPILEXE, expr, _PERIPTOSH, exprcase, exprbody, _PERIPTOSH2, _ALLIOS, eb, _TELOS_EPILOGON) {
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

            //console.log(newcond)
          } else {
            var newcond = new Atom.MathOpRelEq(aAst, cond2ast[j], line);
          }

          newcond2.push(newcond);
        }
        //console.log('====================================');
        //console.log(cond2ast);

        arrCond.push(newcond2);
        arrCondStr.push(line);
        arrLineNo.push(getLineNo(cond2));
        arrBody.push(moreBody[i]);
      }
    }

    //console.log(arrCond);

    var elseBody = eb ? eb.toAST()[0] : null;
    return new MO.Stmt_Select(
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

  WhileExprFunction: function (
    _OSO,
    cond,
    _EPANALAVE,
    body,
    _TELOS_EPANALHPSHS
  ) {
    return new MO.Stmt_WhileLoop(
      cond.toAST(),
      cond.sourceString,
      body.toAST(),
      getLineNo(_OSO),
      getLineNo(_TELOS_EPANALHPSHS)
    );
  },

  DoWhileExprFunction: function (_ARXH_EPANALHPSHS, body, _MEXRIS_OTOU, cond) {
    return new MO.Stmt_Do_WhileLoop(
      cond.toAST(),
      cond.sourceString,
      body.toAST(),
      getLineNo(_ARXH_EPANALHPSHS),
      getLineNo(_MEXRIS_OTOU)
    );
  },

  ForExprFunction: function (
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
    return new MO.Stmt_ForLoop(
      variable.toAST(),
      initval.toAST(),
      finalval.toAST(),
      stepval.toAST(),
      body.toAST(),
      getLineNo(_GIA),
      getLineNo(_TELOS_EPANALHPSHS)
    );
  },

  FunCall: function (a, _1, b, _2) {
    return new MO.CallSubFunction(a.toAST(), b.toAST(), getLineNo(a));
  },
  CallSubProcedure: function (_1, a, _2, b, _3) {
    return new MO.CallSubProcedure(a.toAST(), b.toAST(), getLineNo(a));
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

  Application: function (keyboardData, mainProg, subPrograms) {
    return new MO.Application(
      keyboardData.toAST(),
      mainProg.toAST(),
      subPrograms.toAST()
    );
  },

  Program: function (
    _PROGRAMMA,
    name,
    decl,
    _ARXH,
    mBlock,
    _TELOS_PROGRAMMATOS
  ) {
    return new MO.Program(
      name.toAST(),
      decl.toAST(),
      mBlock.toAST(),
      getLineNo(_PROGRAMMA),
      getLineNo(_ARXH),
      getLineNo(_TELOS_PROGRAMMATOS)
    );
  },

  SubFunction: function (
    _1,
    name,
    _2,
    params,
    _3,
    _4,
    funType,
    decl,
    _7,
    mBlock,
    _TelosSynartisis
  ) {
    return new MO.SubFunction(
      name.toAST(),
      params.toAST(),
      funType.sourceString,
      decl.toAST(),
      mBlock.toAST(),
      getLineNo(name),
      getLineNo(_TelosSynartisis)
    );
  },

  SubProcedure: function (_1, name, _2, params, _3, decl, _6, mBlock, _TelosDiadikasias) {
    return new MO.SubProcedure(
      name.toAST(),
      params.toAST(),
      decl.toAST(),
      mBlock.toAST(),
      getLineNo(name),
      getLineNo(_TelosDiadikasias)
    );
  },

  DefDeclarations: function (_1, statheres, _2, metavlites) {
    return new MO.DefDeclarations(statheres.toAST(), metavlites.toAST());
  },

  DefConstant: function (a, _, b) {
    return new MO.DefConstant(a.toAST(), b.toAST(), getLineNo(a));
  },

  DefVariables: function (a, _, b) {
    return new MO.DefVariables(a.sourceString, b.toAST(), getLineNo(a));
  },

  Block: function (a) {
    return new MO.Stmt_Block(a.toAST());
  },
  BlockFunction: function (a) {
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
