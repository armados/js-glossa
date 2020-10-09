
var MO = require('./objects');
var Atom = require("./atom");


function binop(op,a,b) {  return new Atom.BinaryOp(op, a.toAST(), b.toAST()); }

var operation = {
    floatlit: function (a, _, b)      { return new Atom.MNumber(parseFloat(this.sourceString, 10));  },
    intlit:   function (a)            { return new Atom.MNumber(parseInt(this.sourceString, 10)); },
    strlit:   function (_l, text, _r) { return new Atom.MString(text.sourceString); },
    boollit:  function (a)            { return new Atom.MBoolean( this.sourceString == "ΑΛΗΘΗΣ" ? true : false ); },
    
    Exp7_parens:      (_l, e, _r) => e.toAST(),

    Exp5_powop:       (x, _, y)   => binop('pow',x,y),

    Exp4_mul:         (x, _, y)   => binop('mul',x,y),
    Exp4_div:         (x, _, y)   => binop('div',x,y),

    Exp4_intdiv:      (x, _, y)   => binop('intdiv',x,y),
    Exp4_intmod:      (x, _, y)   => binop('intmod',x,y),

    Exp3_add:         (x, _, y)   => binop('add',x,y),
    Exp3_sub:         (x, _, y)   => binop('sub',x,y),

    Exp2_lt:          (a, _, b)   => binop('lt', a,b),
    Exp2_gt:          (a, _, b)   => binop('gt', a,b),
    Exp2_lte:         (a, _, b)   => binop('lte',a,b),
    Exp2_gte:         (a, _, b)   => binop('gte',a,b),
    Exp2_eq:          (a, _, b)   => binop('eq', a,b),
    Exp2_neq:         (a, _, b)   => binop('neq', a,b),

    Exp6_not:         (_, a)      => new Atom.BooleanNotOp(a.toAST()),
    Exp1_andop:       (a, _, b)   => binop('and',a,b),
    Exp_orop:         (a, _, b)   => binop('or',a,b),

    Exp6_neq:         (_, a)      => new Atom.BinaryOp('mul', a.toAST(), new Atom.MNumber(-1)),

    identifier:      function (a, b)         { return new MO.MSymbol(this.sourceString, null) },
    
    IdentifierTblAssign: function (a, _l, b, _r) { return new MO.MSymbolTableAssign(a.sourceString, b.toAST()); },
    IdentifierTblFetch:  function (a, _l, b, _r) { return new MO.MSymbolTableFetch(a.sourceString, b.toAST()); },

    AssignExpr: (a, _, b) => new MO.Stmt_Assignment(a.toAST(), b.toAST()),

    KeyboardData: (_1, a) => new MO.KeyboardDataFromSource(a.toAST()),

    
    IfExpr: function (_1, cond, _2, tb, _AlliosAn, condElseIf, _Tote, blockElseIf, _3, eb, _4) {
        var thenBody = tb.toAST();
        var moreBody = blockElseIf.toAST();
        var elseBody = eb ? eb.toAST()[0] : null;
        return new MO.Stmt_IfCond(cond.toAST(), thenBody, condElseIf.toAST(), moreBody, elseBody);
    }, 


    WhileExpr:   (_1, cond, _2, body, _3) => new MO.Stmt_WhileLoop(cond.toAST(), body.toAST()),

    DoWhileExpr: (_1, body, _2, cond)     => new MO.Stmt_Do_WhileLoop(cond.toAST(), body.toAST()),

    ForExpr: (_1, variable, _2, initval, _3, finalval, _4, stepval, _5, body, _6) => 
    new MO.Stmt_ForLoop(variable.toAST(), initval.toAST(), finalval.toAST(), stepval.toAST(), body.toAST()),

    FunCall: (a, _1, b, _2) => new MO.CallSubFunction(a.toAST(), b.toAST()),
    CallSubProcedure: (_1, a, _2, b, _3) => new MO.CallSubProcedure(a.toAST(), b.toAST()),

 //   TblCellWrite: (tblname, _1, tblindex, _2) => new MO.TblCellWrite(tblname.sourceString, tblindex.toAST()),
//    TblCellRead:  (tblname, _1, tblindex, _2) => new MO.TblCellRead(tblname.sourceString, tblindex.toAST()),

    Arguments:             (a) => a.asIteration().toAST(),
    AtLeastOneArguments:   (a) => a.asIteration().toAST(),

    AtLeastOneParameters:  (a) => a.asIteration().toAST(),
    Parameters:            (a) => a.asIteration().toAST(),
    
    VarParameters:         (a) => a.asIteration().toAST(),
    VarParametersAssign:   (a) => a.asIteration().toAST(),
    

    Application: function(keyboardData, mainProg, subPrograms) { 
        return new MO.Application(keyboardData.toAST(), mainProg.toAST(), subPrograms.toAST()); },

    Program: function(_1, name, decl, _5, mBlock, _6)  {
        return new MO.Program(name.toAST(), decl.toAST(), mBlock.toAST()); },

    SubFunction: function(_1, name, _2, params, _3, _4, funType , decl, _7, mBlock, _8) { 
        return new MO.SubFunction(name.toAST(), params.toAST(), funType.sourceString, decl.toAST(), mBlock.toAST()); },

    SubProcedure: function(_1, name, _2, params, _3, decl, _6, mBlock, _7) {       
        return new MO.SubProcedure(name.toAST(), params.toAST(), decl.toAST(), mBlock.toAST()); },
 
    DefDeclarations: function(_1, statheres, _2, metavlites) {       
        return new MO.DefDeclarations(statheres.toAST(), metavlites.toAST()); },

    DefConstant:  (constid, _, constval) => new MO.DefConstant(constid.toAST(), constval.toAST()),

    DefVariables: (varType, _2, vars)    => new MO.DefVariables(varType.sourceString , vars.toAST()),

    Block: function(commands)      { return new MO.Stmt_Block(commands.toAST()); },
    FuncBlock: function(commands)  { return new MO.Stmt_Block(commands.toAST()); },    

    Stmt_Write: function(_, tmp)   { return new MO.Stmt_Write(tmp.toAST()); },
    
    Stmt_Read: function(_, tmp)    { return new MO.Stmt_Read(tmp.toAST()); }

};

module.exports = {
    load: function (gram) {
        return gram.createSemantics().addOperation('toAST', operation);
    }
};
