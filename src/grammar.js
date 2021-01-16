"use strict";

function getGrammar() {
  return `Glwssa {

      Application  = 
        nl*
        CommentInlineInput*
        MainProgram
        (UserFunction | UserProcedure)*
    
      MainProgram      = 
        "ΠΡΟΓΡΑΜΜΑ" id nl+
        Declaration_Block
        "ΑΡΧΗ" nl+
        Block
        "ΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ" id? nl*

      UserFunction  = 
        "ΣΥΝΑΡΤΗΣΗ"  id "(" AtLeastOneParameters ")" ":" ("ΑΚΕΡΑΙΑ" | "ΠΡΑΓΜΑΤΙΚΗ" | "ΧΑΡΑΚΤΗΡΑΣ" | "ΛΟΓΙΚΗ") nl+
        Declaration_Block
        "ΑΡΧΗ" nl+
        BlockFunction
        "ΤΕΛΟΣ_ΣΥΝΑΡΤΗΣΗΣ" nl*
        
      UserProcedure = 
        "ΔΙΑΔΙΚΑΣΙΑ" id ("(" Parameters ")")? nl+
        Declaration_Block
        "ΑΡΧΗ" nl+
        Block
        "ΤΕΛΟΣ_ΔΙΑΔΙΚΑΣΙΑΣ" nl*

      Declaration_Block = 
        ("ΣΤΑΘΕΡΕΣ" nl+ 
        DefConstant*)?
        ("ΜΕΤΑΒΛΗΤΕΣ" nl+ 
        DefVariables*)?

      DefConstant  = id "=" Expr nl+

      DefVariables = ("ΑΚΕΡΑΙΕΣ" | "ΠΡΑΓΜΑΤΙΚΕΣ" | "ΧΑΡΑΚΤΗΡΕΣ" | "ΛΟΓΙΚΕΣ") ":" VarParameters nl+
      
      Block = (InnerCommand nl+)*
      BlockFunction = (InnerCommandFunction nl+)*

      InnerCommand         = AssignExpr | WhileExpr | DoWhileExpr | ForExpr | IfExpr | Stmt_Select | comment | ProcedureCall | Stmt_Write | Stmt_Read
      InnerCommandFunction = AssignExpr | WhileExprFunction | DoWhileExprFunction | ForExprFunction | IfExprFunction | Stmt_Select | comment //FIXME:

      AssignExpr   = (IdTbl | id) "<-" Expr

      Stmt_Write    = grapse Arguments 
      Stmt_Read     = diavase VarParameters

      WhileExpr     = "ΟΣΟ" Expr "ΕΠΑΝΑΛΑΒΕ" nl+ Block "ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ"
      DoWhileExpr   = "ΑΡΧΗ_ΕΠΑΝΑΛΗΨΗΣ" nl+ Block "ΜΕΧΡΙΣ_ΟΤΟΥ" Expr
      ForExpr       = "ΓΙΑ" (IdTbl | id) "ΑΠΟ" Expr "ΜΕΧΡΙ" Expr (("ΜΕ_ΒΗΜΑ" | "ΜΕ ΒΗΜΑ") Expr)? nl+ Block "ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ"
      IfExpr        = "ΑΝ" Expr "ΤΟΤΕ" nl+ Block ("ΑΛΛΙΩΣ_ΑΝ" Expr "ΤΟΤΕ" nl+ Block)* ("ΑΛΛΙΩΣ" nl+ Block)? "ΤΕΛΟΣ_ΑΝ"

      Subrange      = Expr ".." Expr
      SelectExpr    = "<" Expr | "<=" Expr | ">" Expr | ">=" Expr | "=" Expr | "<>" Expr
      SelectCase    = Subrange | SelectExpr | Expr 
      AtLeastOneSelectCase = NonemptyListOf<SelectCase, ",">
      Stmt_Select   = "ΕΠΙΛΕΞΕ" Expr nl+ ("ΠΕΡΙΠΤΩΣΗ" ~"ΑΛΛΙΩΣ" AtLeastOneSelectCase nl+ Block)* ("ΠΕΡΙΠΤΩΣΗ" "ΑΛΛΙΩΣ" nl+ Block)? "ΤΕΛΟΣ_ΕΠΙΛΟΓΩΝ"

      WhileExprFunction     = "ΟΣΟ" Expr "ΕΠΑΝΑΛΑΒΕ" nl+ BlockFunction "ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ"
      DoWhileExprFunction   = "ΑΡΧΗ_ΕΠΑΝΑΛΗΨΗΣ" nl+ BlockFunction "ΜΕΧΡΙΣ_ΟΤΟΥ" Expr
      ForExprFunction       = "ΓΙΑ" (IdTbl | id) "ΑΠΟ" Expr "ΜΕΧΡΙ" Expr (("ΜΕ_ΒΗΜΑ" | "ΜΕ ΒΗΜΑ") Expr)? nl+ BlockFunction "ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ"
      IfExprFunction        = "ΑΝ" Expr "ΤΟΤΕ" nl+ BlockFunction ("ΑΛΛΙΩΣ_ΑΝ" Expr "ΤΟΤΕ" nl+ BlockFunction)* ("ΑΛΛΙΩΣ" nl+ BlockFunction)? "ΤΕΛΟΣ_ΑΝ"

      FunctionCall          = id "(" Arguments ")"
      ProcedureCall         = "ΚΑΛΕΣΕ" id ("(" Arguments ")")? 

      AtLeastOneArguments   = NonemptyListOf<Expr, ",">
      Arguments             = ListOf<Expr, ","> 

      AtLeastOneParameters   = NonemptyListOf<id, ",">
      Parameters             = ListOf<id, ",">

      VarParameters          = NonemptyListOf<(IdTbl | id), ",">

      AtLeastOneLit          = NonemptyListOf<Expr, ",">
      CommentInlineInput     = keyboardinput AtLeastOneLit nl+

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


     Expr = Exp 

     Exp
       = ExpOr
       
     ExpOr
       =  ExpOr or ExpAnd               -- orop
       |  ExpAnd
               
     ExpAnd
       =  ExpAnd and ExpRel             -- andop
       |  ExpRel          

     ExpRel
       =  ExpRel "<"  AddExp             -- lt
       |  ExpRel ">"  AddExp             -- gt
       |  ExpRel "<=" AddExp             -- lte
       |  ExpRel ">=" AddExp             -- gte
       |  ExpRel "="  AddExp             -- eq
       |  ExpRel "<>" AddExp             -- neq
       |  AddExp    
       
     AddExp
       =  AddExp "+" MulExp              -- add
       |  AddExp "-" MulExp              -- sub
       |  MulExp

     MulExp
       =  MulExp "*" ExpExp             -- mul
       |  MulExp "/" ExpExp             -- div
       |  MulExp div ExpExp             -- intdiv
       |  MulExp mod ExpExp             -- intmod
       |  ExpExp

     ExpExp
       = ExpExp "^" PriExp              -- powop
       | PriExp

     PriExp
       = "(" Exp ")"                    -- parens
       | "+" ExpExp                     -- pos
       | "-" ExpExp                     -- neg
       |  not ExpOr                     -- not
       |  boollit
       |  floatlit
       |  intlit
       |  strlit
       |  FunctionCall
       |  IdTbl
       |  id

      IdTbl         = id "[" AtLeastOneArguments "]"

      id            = ~reservedWord  letter (letter|digit|"_")* 

      idrest        = letter | digit | "_"

      powop         =  "^"
      mulop         =  "*" | "/" | div | mod
      addop         =  "+" | "-"
      relop         =  "<" | "<=" | ">" | ">=" | "=" | "<>"
      prefixop      =  neq | not
      neq           =  "-"

      lit           = floatlit | intlit | strlit | boollit
      floatlit      = digit* "." digit+ 
      intlit        = digit+
      qq            = "'" | "\\""
      strlit        = qq (~qq any)* qq
      boollit       = true | false

      keyboardinput =  "!" whitespace* "KEYBOARD_INPUT:"
      comment       = ~keyboardinput "!" (~nl any)*

      nl            = "\\n" | "\\r"        

      whitespace    = "\t" | " "
      breakLine     = ("\\n" | "\\r")+ whitespace* "&"

      space        := breakLine | whitespace | comment  


  }`;
}

module.exports = {
  getGrammar,
};
