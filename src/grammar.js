"use strict";

class GrammarOhm {
  getGrammar() {
    const grammar = `
        Glwssa {

            Application  = KeyboardData* Program (SubFunction | SubProcedure)*
         
            Program      = "ΠΡΟΓΡΑΜΜΑ" identifier DefDeclarations "ΑΡΧΗ" Block "ΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ" 
        
            SubFunction  = "ΣΥΝΑΡΤΗΣΗ"  identifier "(" AtLeastOneParameters ")" ":" ("ΑΚΕΡΑΙΑ" | "ΠΡΑΓΜΑΤΙΚΗ" | "ΧΑΡΑΚΤΗΡΑΣ" | "ΛΟΓΙΚΗ")  DefDeclarations "ΑΡΧΗ" BlockFunction "ΤΕΛΟΣ_ΣΥΝΑΡΤΗΣΗΣ"
            SubProcedure = "ΔΙΑΔΙΚΑΣΙΑ" identifier "(" Parameters ")" DefDeclarations "ΑΡΧΗ" Block "ΤΕΛΟΣ_ΔΙΑΔΙΚΑΣΙΑΣ"
        
            DefDeclarations = ("ΣΤΑΘΕΡΕΣ" DefConstant+)?
                              ("ΜΕΤΑΒΛΗΤΕΣ" DefVariables*)?
        
            DefConstant  = identifier "=" Expr
            DefVariables = ("ΑΚΕΡΑΙΕΣ" | "ΠΡΑΓΜΑΤΙΚΕΣ" | "ΧΑΡΑΚΤΗΡΕΣ" | "ΛΟΓΙΚΕΣ") ":" VarParametersAssign
           
            AssignExpr   = (IdentifierTblAssign | identifier) "<-" Expr
        
            Expr =      Exp  
        
            Exp         =  Exp or Exp1               -- orop
                        |  Exp1
            Exp1        =  Exp1 and Exp2             -- andop
                        |  Exp2
            Exp2        =  Exp3 "<" Exp3             -- lt
                        |  Exp3 ">" Exp3             -- gt
                        |  Exp3 "<=" Exp3            -- lte
                        |  Exp3 ">=" Exp3            -- gte
                        |  Exp3 "=" Exp3             -- eq
                        |  Exp3 "<>" Exp3            -- neq
                        |  Exp3
            Exp3        =  Exp3 "+" Exp4             -- add
                        |  Exp3 "-" Exp4             -- sub
                        |  Exp4
            Exp4        =  Exp4 "*" Exp5             -- mul
                        |  Exp4 "/" Exp5             -- div
                        |  Exp4 div Exp5             -- intdiv
                        |  Exp4 mod Exp5             -- intmod
                        |  Exp5
            Exp5        =  Exp5 powop  Exp6          -- powop
                        |  Exp6
            Exp6        =  not Exp7                  -- not
                        |  neq Exp7                  -- neq
                        |  Exp7
            Exp7        =  boollit
                        |  floatlit
                        |  intlit
                        |  strlit
                        |  FunCall
                        |  IdentifierTblFetch
                        |  identifier
                        |  "(" Exp ")"               -- parens
        
        
            Block = InnerCommand*
            BlockFunction = InnerCommandFunction*
        
            InnerCommand         = AssignExpr | WhileExpr | DoWhileExpr | ForExpr | IfExpr | comment | CallSubProcedure | Stmt_Write | Stmt_Read
            InnerCommandFunction = AssignExpr | WhileExprFunction | DoWhileExprFunction | ForExprFunction | IfExprFunction | comment 
        
            Stmt_Write = grapse Arguments
            Stmt_Read  = diavase VarParametersAssign
        
            WhileExpr     = "ΟΣΟ" Expr "ΕΠΑΝΑΛΑΒΕ" Block "ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ"
            DoWhileExpr   = "ΑΡΧΗ_ΕΠΑΝΑΛΗΨΗΣ" Block "ΜΕΧΡΙΣ_ΟΤΟΥ" Expr
            ForExpr       = "ΓΙΑ" identifier "ΑΠΟ" Expr "ΜΕΧΡΙ" Expr (("ΜΕ_ΒΗΜΑ" | "ΜΕ ΒΗΜΑ") Expr)? lineTerminator* Block "ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ"
            IfExpr        = "ΑΝ" Expr "ΤΟΤΕ" Block ("ΑΛΛΙΩΣ_ΑΝ" Expr "ΤΟΤΕ" Block)* ("ΑΛΛΙΩΣ" Block)? "ΤΕΛΟΣ_ΑΝ"
        
            WhileExprFunction     = "ΟΣΟ" Expr "ΕΠΑΝΑΛΑΒΕ" BlockFunction "ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ"
            DoWhileExprFunction   = "ΑΡΧΗ_ΕΠΑΝΑΛΗΨΗΣ" BlockFunction "ΜΕΧΡΙΣ_ΟΤΟΥ" Expr
            ForExprFunction       = "ΓΙΑ" identifier "ΑΠΟ" Expr "ΜΕΧΡΙ" Expr (("ΜΕ_ΒΗΜΑ" | "ΜΕ ΒΗΜΑ") Expr)? lineTerminator* BlockFunction "ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ"
            IfExprFunction        = "ΑΝ" Expr "ΤΟΤΕ" BlockFunction ("ΑΛΛΙΩΣ_ΑΝ" Expr "ΤΟΤΕ" BlockFunction)* ("ΑΛΛΙΩΣ" BlockFunction)? "ΤΕΛΟΣ_ΑΝ"
        





            //function calls and variables
            FunCall          = identifier "(" Arguments ")"
            CallSubProcedure = "ΚΑΛΕΣΕ" identifier "(" Arguments ")" 
        
            IdentifierTblAssign      = identifier "[" AtLeastOneArguments "]"
            IdentifierTblFetch       = identifier "[" AtLeastOneArguments "]"
        
            AtLeastOneArguments = NonemptyListOf<Expr, ",">
            Arguments           = ListOf<Expr, ",">
        
            AtLeastOneParameters = NonemptyListOf<identifier, ",">
            Parameters           = ListOf<identifier, ",">
        
            VarParameters = NonemptyListOf<(IdentifierTblFetch | identifier), ",">   // parameters when define variables
            VarParametersAssign = NonemptyListOf<(IdentifierTblAssign | identifier), ",">   // parameters when define variables
         
            KeyboardData = keyboardinput AtLeastOneArguments
        
            reservedWord = grapse | diavase | and | or | not | div | mod | boollit
        
            grapse       = "ΓΡΑΨΕ" ~idrest
            diavase      = "ΔΙΑΒΑΣΕ" ~idrest
        
            true        =  ("ΑΛΗΘΗΣ" | "ΑΛΗΘΉΣ" | "αληθης" | "αληθής") ~idrest
            false       =  ("ΨΕΥΔΗΣ" | "ΨΕΥΔΉΣ" | "ψευδης" | "ψευδής") ~idrest
            or          =  ("Η" | "Ή" | "ή" | "η") ~idrest
            and         =  ("ΚΑΙ" | "και") ~idrest
            not         =  ("ΟΧΙ" | "ΌΧΙ" | "οχι" | "όχι") ~idrest
        
            div         =  ("DIV" | "div") ~idrest
            mod         =  ("MOD" | "mod") ~idrest
        
            /*    function     = "ΣΥΝΑΡΤΗΣΗ" ~idchar
                if           = "ΑΝ" ~idchar
                else         = "ΑΛΛΙΩΣ" ~idchar
                while        = "ΟΣΟ" ~idchar
            */
        
            identifier = ~reservedWord  letter (letter|digit|"_")* 
        
            idrest = letter | digit | "_"
        
            powop       =  "^"
            mulop       =  "*" | "/" | div | mod
            addop       =  "+" | "-"
            relop       =  "<" | "<=" | ">" | ">=" | "=" | "<>"
            prefixop    =  neq | not
            neq         =  "-"
        
            number =   floatlit | intlit
        
            lit         = floatlit | intlit | strlit | boollit
            floatlit    = digit* "." digit+ 
            intlit      = digit+
            qq          = "'" | "\\""
            strlit      = qq (~qq any)+ qq
            boollit     = true | false
        
        
            keyboardinput =  "! KEYBOARD_INPUT:"
        
            comment = ~keyboardinput "!" (~lineTerminator any)*
        
            lineTerminator = "\\n" | "\\r"
        
            whitespace = "\t" | " "
            breakLine = "&"
            space := whitespace | lineTerminator | comment | breakLine  
        }
                
        `;
    return grammar;
  }
}

module.exports = {
  GrammarOhm
};
