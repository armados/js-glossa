
const MO = require('./objects');
const Atom = require("./atom");


function getLineNo(cmd) {
    var scode = cmd.source.sourceString;
    var endChar = cmd.source.startIdx;
    var res = scode.substring(0, endChar-1); 
    var lineNo = res.split(/\r\n|\r|\n/).length;
    return lineNo; 
}



var operation = {
    floatlit: function (a, _, b)      { return new Atom.MNumber(parseFloat(this.sourceString, 10))  },
    intlit:   function (a)            { return new Atom.MNumber(parseInt(this.sourceString, 10)) },
    strlit:   function (_l, a, _r)    { return new Atom.MString(a.sourceString) },
    true:     function (a)            { return new Atom.MBoolean( true )  },
    false:    function (a)            { return new Atom.MBoolean( false ) },

    Exp7_parens:      function (_l, a, _r) { return a.toAST() },

    Exp5_powop:       function (a, _, b)   { return new Atom.MathOpPow(a.toAST(), b.toAST(), getLineNo(a)) },

    Exp4_mul:         function (a, _, b)   { return new Atom.MathOpMul(a.toAST(), b.toAST(), getLineNo(a)) },
    Exp4_div:         function (a, _, b)   { return new Atom.MathOpDiv(a.toAST(), b.toAST(), getLineNo(a)) },

    Exp4_intdiv:      function (a, _, b)   { return new Atom.MathOpDivInt(a.toAST(), b.toAST(), getLineNo(a)) },
    Exp4_intmod:      function (a, _, b)   { return new Atom.MathOpModInt(a.toAST(), b.toAST(), getLineNo(a)) },

    Exp3_add:         function (a, _, b)   { return new Atom.MathOpAdd(a.toAST(), b.toAST(), getLineNo(a)) },
    Exp3_sub:         function (a, _, b)   { return new Atom.MathOpSub(a.toAST(), b.toAST(), getLineNo(a)) },

    Exp2_lt:          function (a, _, b)   { return new Atom.MathOpRelLt(a.toAST(), b.toAST(), getLineNo(a)) },
    Exp2_gt:          function (a, _, b)   { return new Atom.MathOpRelGt(a.toAST(), b.toAST(), getLineNo(a)) },
    Exp2_lte:         function (a, _, b)   { return new Atom.MathOpRelLte(a.toAST(), b.toAST(), getLineNo(a)) },
    Exp2_gte:         function (a, _, b)   { return new Atom.MathOpRelGte(a.toAST(), b.toAST(), getLineNo(a)) },
    Exp2_eq:          function (a, _, b)   { return new Atom.MathOpRelEq(a.toAST(), b.toAST(), getLineNo(a)) },
    Exp2_neq:         function (a, _, b)   { return new Atom.MathOpRelNeq(a.toAST(), b.toAST(), getLineNo(a)) },

    Exp6_not:         function (_, a)      { return new Atom.MathOpLogNot(a.toAST(), getLineNo(a)) },
    Exp1_andop:       function (a, _, b)   { return new Atom.MathOpLogAnd(a.toAST(), b.toAST(), getLineNo(a)) },
    Exp_orop:         function (a, _, b)   { return new Atom.MathOpLogOr(a.toAST(), b.toAST(), getLineNo(a)) },

    Exp6_neq:         function (_, a)      { return new Atom.MathOpMul(a.toAST(), new Atom.MNumber(-1), getLineNo(a)) },

    identifier:      function (a, b)         { return new MO.MSymbol(this.sourceString, null) },
    
    IdentifierTblAssign: function (a, _l, b, _r) { return new MO.MSymbolTableAssign(a.sourceString, b.toAST()); },
    IdentifierTblFetch:  function (a, _l, b, _r) { return new MO.MSymbolTableFetch(a.sourceString, b.toAST()); },

    AssignExpr: function (a, _, b) { return new MO.Stmt_Assignment(a.toAST(), b.toAST(), a.sourceString, b.sourceString, getLineNo(a)) },

    KeyboardData: function (_1, a) { return new MO.KeyboardDataFromSource(a.toAST()) },

    
    IfExpr: function (_1, cond, _2, tb, _AlliosAn, condElseIf, _Tote, blockElseIf, _Allios, eb, _TelosAn) {

            if (condElseIf.numChildren) {
                //console.log(blockElseIf.children);
                condElseIf.children.forEach(function(entry) {
                    //console.log('LineNo: ', getLineNo(entry)); 
            });
        }

        var thenBody = tb.toAST();
        var moreBody = blockElseIf.toAST();
        var elseBody = eb ? eb.toAST()[0] : null;
        return new MO.Stmt_IfCond(cond.toAST(), cond.sourceString, thenBody, condElseIf.toAST(), moreBody, elseBody);
    }, 


    WhileExpr:   (_1, cond, _2, body, _3) => new MO.Stmt_WhileLoop(cond.toAST(), cond.sourceString, body.toAST(), getLineNo(cond)),

    DoWhileExpr: (_1, body, _2, cond)     => new MO.Stmt_Do_WhileLoop(cond.toAST(), cond.sourceString, body.toAST(), getLineNo(cond)),

    ForExpr: (_1, variable, _2, initval, _3, finalval, _4, stepval, _5, body, _6) => 
    new MO.Stmt_ForLoop(variable.toAST(), initval.toAST(), finalval.toAST(), stepval.toAST(), body.toAST(), getLineNo(variable)),

    FunCall: (a, _1, b, _2) => new MO.CallSubFunction(a.toAST(), b.toAST(), getLineNo(a)),
    CallSubProcedure: (_1, a, _2, b, _3) => new MO.CallSubProcedure(a.toAST(), b.toAST(), getLineNo(_1)),

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

    DefConstant:  function(constid, _, constval) { return new MO.DefConstant(constid.toAST(), constval.toAST()); },

    DefVariables: function(varType, _2, vars)    { return new MO.DefVariables(varType.sourceString , vars.toAST()) },

    Block: function(commands)      { return new MO.Stmt_Block(commands.toAST()); },
    FuncBlock: function(commands)  { return new MO.Stmt_Block(commands.toAST()); },    

    Stmt_Write: function(_, cmd)   { return new MO.Stmt_Write(cmd.toAST(), getLineNo(cmd)); },
    
    Stmt_Read: function(_, cmd)    { return new MO.Stmt_Read(cmd.toAST(), getLineNo(cmd)); }

};

module.exports = {
    load: function (gram) {
        return gram.createSemantics().addOperation('toAST', operation);
    }
};
