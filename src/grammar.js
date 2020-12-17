"use strict";

class GrammarOhm {
  getGrammar() {
    const grammar = `
        Glwssa {

            Application  = KeyboardData* Program (SubFunction | SubProcedure)*
         
            Program      = "ΠΡΟΓΡΑΜΜΑ" id DefDeclarations "ΑΡΧΗ" Block "ΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ" 
        
            SubFunction  = "ΣΥΝΑΡΤΗΣΗ"  id "(" AtLeastOneParameters ")" ":" ("ΑΚΕΡΑΙΑ" | "ΠΡΑΓΜΑΤΙΚΗ" | "ΧΑΡΑΚΤΗΡΑΣ" | "ΛΟΓΙΚΗ")  DefDeclarations "ΑΡΧΗ" BlockFunction "ΤΕΛΟΣ_ΣΥΝΑΡΤΗΣΗΣ"
            SubProcedure = "ΔΙΑΔΙΚΑΣΙΑ" id "(" Parameters ")" DefDeclarations "ΑΡΧΗ" Block "ΤΕΛΟΣ_ΔΙΑΔΙΚΑΣΙΑΣ"
        
            DefDeclarations = ("ΣΤΑΘΕΡΕΣ" DefConstant+)?
                              ("ΜΕΤΑΒΛΗΤΕΣ" DefVariables*)?
        
            DefConstant  = id "=" Expr
            DefVariables = ("ΑΚΕΡΑΙΕΣ" | "ΠΡΑΓΜΑΤΙΚΕΣ" | "ΧΑΡΑΚΤΗΡΕΣ" | "ΛΟΓΙΚΕΣ") ":" VarParameters
           
            AssignExpr   = (IdTbl | id) "<-" Expr
        
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
                        |  IdTbl
                        |  id
                        |  "(" Exp ")"               -- parens
        
        
            Block = InnerCommand*
            BlockFunction = InnerCommandFunction*
        
            InnerCommand         = AssignExpr | WhileExpr | DoWhileExpr | ForExpr | IfExpr | Stmt_Select | comment | CallSubProcedure | Stmt_Write | Stmt_Read
            InnerCommandFunction = AssignExpr | WhileExprFunction | DoWhileExprFunction | ForExprFunction | IfExprFunction | Stmt_Select | comment //FIXME:
        
            Stmt_Write = grapse Arguments
            Stmt_Read  = diavase VarParameters
        
            WhileExpr     = "ΟΣΟ" Expr "ΕΠΑΝΑΛΑΒΕ" Block "ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ"
            DoWhileExpr   = "ΑΡΧΗ_ΕΠΑΝΑΛΗΨΗΣ" Block "ΜΕΧΡΙΣ_ΟΤΟΥ" Expr
            ForExpr       = "ΓΙΑ" (IdTbl | id) "ΑΠΟ" Expr "ΜΕΧΡΙ" Expr (("ΜΕ_ΒΗΜΑ" | "ΜΕ ΒΗΜΑ") Expr)? nl* Block "ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ"
            IfExpr        = "ΑΝ" Expr "ΤΟΤΕ" Block ("ΑΛΛΙΩΣ_ΑΝ" Expr "ΤΟΤΕ" Block)* ("ΑΛΛΙΩΣ" Block)? "ΤΕΛΟΣ_ΑΝ"
        
            Subrange      = Expr ".." Expr
            SelectExpr    = "<" Expr | "<=" Expr | ">" Expr | ">=" Expr | "=" Expr | "<>" Expr
            SelectCase    = Subrange | SelectExpr | Expr 
            AtLeastOneSelectCase = NonemptyListOf<SelectCase, ",">
            Stmt_Select   = "ΕΠΙΛΕΞΕ" Expr ("ΠΕΡΙΠΤΩΣΗ" ~"ΑΛΛΙΩΣ" AtLeastOneSelectCase Block)* ("ΠΕΡΙΠΤΩΣΗ" "ΑΛΛΙΩΣ" Block)? "ΤΕΛΟΣ_ΕΠΙΛΟΓΩΝ"


            WhileExprFunction     = "ΟΣΟ" Expr "ΕΠΑΝΑΛΑΒΕ" BlockFunction "ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ"
            DoWhileExprFunction   = "ΑΡΧΗ_ΕΠΑΝΑΛΗΨΗΣ" BlockFunction "ΜΕΧΡΙΣ_ΟΤΟΥ" Expr
            ForExprFunction       = "ΓΙΑ" (IdTbl | id) "ΑΠΟ" Expr "ΜΕΧΡΙ" Expr (("ΜΕ_ΒΗΜΑ" | "ΜΕ ΒΗΜΑ") Expr)? nl* BlockFunction "ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ"
            IfExprFunction        = "ΑΝ" Expr "ΤΟΤΕ" BlockFunction ("ΑΛΛΙΩΣ_ΑΝ" Expr "ΤΟΤΕ" BlockFunction)* ("ΑΛΛΙΩΣ" BlockFunction)? "ΤΕΛΟΣ_ΑΝ"
        





            FunCall             = id "(" Arguments ")"
            CallSubProcedure    = "ΚΑΛΕΣΕ" id "(" Arguments ")" 
        
            AtLeastOneArguments = NonemptyListOf<Expr, ",">
            Arguments           = ListOf<Expr, ",">
        
            AtLeastOneParameters = NonemptyListOf<id, ",">
            Parameters           = ListOf<id, ",">
        
            VarParameters       = NonemptyListOf<(IdTbl | id), ",">   // parameters when define variables
  
            AtLeastOneLit       = NonemptyListOf<(floatlit | intlit | strlit), ",">
            KeyboardData = keyboardinput AtLeastOneLit
        
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
        
            IdTbl = id "[" AtLeastOneArguments "]"

            id = ~reservedWord  letter (letter|digit|"_")* 


            idrest = letter | digit | "_"
        
            powop       =  "^"
            mulop       =  "*" | "/" | div | mod
            addop       =  "+" | "-"
            relop       =  "<" | "<=" | ">" | ">=" | "=" | "<>"
            prefixop    =  neq | not
            neq         =  "-"
        
        
            lit         = floatlit | intlit | strlit | boollit
            floatlit    = digit* "." digit+ 
            intlit      = digit+
            qq          = "'" | "\\""
            strlit      = qq (~qq any)+ qq
            boollit     = true | false
        
        
            keyboardinput =  "!" whitespace* "KEYBOARD_INPUT:"
        
            comment = ~keyboardinput "!" (~nl any)*
        
            nl = "\\n" | "\\r"

            whitespace = "\t" | " "
            breakLine = "&"
            space := whitespace | nl | comment | breakLine  
        }
                
        `;
    return grammar;
  }
}

module.exports = {
  GrammarOhm
};
