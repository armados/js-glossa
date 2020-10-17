$(document).ready(function () {

  CodeMirror.defineMode("glossa", function() {
    function words(str) {
      var obj = {}, words = str.split(" ");
      for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
      return obj;
    }
    var keywords = words(
      "absolute and array asm begin case const constructor destructor div do " +
      "downto else end file for function goto if implementation in inherited " +
      "inline interface label mod nil not object of operator or packed procedure " +
      "program record reintroduce repeat self set shl shr string then to type " +
      "unit until uses var while with xor as class dispinterface except exports " +
      "finalization finally initialization inline is library on out packed " +
      "property raise resourcestring threadvar try absolute abstract alias " +
      "assembler bitpacked break cdecl continue cppdecl cvar default deprecated " +
      "dynamic enumerator experimental export external far far16 forward generic " +
      "helper implements index interrupt iocheck local message name near " +
      "nodefault noreturn nostackframe oldfpccall otherwise overload override " +
      "pascal platform private protected public published read register " +
      "reintroduce result safecall saveregisters softfloat specialize static " +
      "stdcall stored strict unaligned unimplemented varargs virtual write");
    var atoms = {"null": true};
  
    var isOperatorChar = /[+\-*&%=<>!?|\/]/;
  
    function tokenBase(stream, state) {
      var ch = stream.next();
      if (ch == "#" && state.startOfLine) {
        stream.skipToEnd();
        return "meta";
      }
      if (ch == '"' || ch == "'") {
        state.tokenize = tokenString(ch);
        return state.tokenize(stream, state);
      }
      if (ch == "(" && stream.eat("*")) {
        state.tokenize = tokenComment;
        return tokenComment(stream, state);
      }
      if (ch == "{") {
        state.tokenize = tokenCommentBraces;
        return tokenCommentBraces(stream, state);
      }
      if (/[\[\]\(\),;\:\.]/.test(ch)) {
        return null;
      }
      if (/\d/.test(ch)) {
        stream.eatWhile(/[\w\.]/);
        return "number";
      }
      if (ch == "/") {
        if (stream.eat("/")) {
          stream.skipToEnd();
          return "comment";
        }
      }
      if (isOperatorChar.test(ch)) {
        stream.eatWhile(isOperatorChar);
        return "operator";
      }
      stream.eatWhile(/[\w\$_]/);
      var cur = stream.current();
      if (keywords.propertyIsEnumerable(cur)) return "keyword";
      if (atoms.propertyIsEnumerable(cur)) return "atom";
      return "variable";
    }
  
    function tokenString(quote) {
      return function(stream, state) {
        var escaped = false, next, end = false;
        while ((next = stream.next()) != null) {
          if (next == quote && !escaped) {end = true; break;}
          escaped = !escaped && next == "\\";
        }
        if (end || !escaped) state.tokenize = null;
        return "string";
      };
    }
  
    function tokenComment(stream, state) {
      var maybeEnd = false, ch;
      while (ch = stream.next()) {
        if (ch == ")" && maybeEnd) {
          state.tokenize = null;
          break;
        }
        maybeEnd = (ch == "*");
      }
      return "comment";
    }
  
    function tokenCommentBraces(stream, state) {
      var ch;
      while (ch = stream.next()) {
        if (ch == "}") {
          state.tokenize = null;
          break;
        }
      }
      return "comment";
    }
  
    // Interface
  
    return {
      startState: function() {
        return {tokenize: null};
      },
  
      token: function(stream, state) {
        if (stream.eatSpace()) return null;
        var style = (state.tokenize || tokenBase)(stream, state);
        if (style == "comment" || style == "meta") return style;
        return style;
      },
  
      electricChars: "{}"
    };
  });
  
  CodeMirror.defineMIME("text/x-glossa", "glossa");


  $("h4").click(function (e) {
    e.preventDefault();
    editor.setTheme("ace/theme/gruvbox");
  });

  $(".btnShowInput").click(function (e) {
    e.preventDefault();
    $("#outputTab").hide();
    $("#outputTabDetails").hide();
    $("#inputTab").show();
  });

  $(".btnShowOutput").click(function (e) {
    e.preventDefault();
    $("#inputTab").hide();
    $("#outputTab").show();
    $("#outputTabDetails").hide();
  });

  $(".btnShowOutputDetails").click(function (e) {
    e.preventDefault();
    $("#inputTab").hide();
    $("#outputTab").hide();
    $("#outputTabDetails").show();
  });

  $("#spinner").hide();

 
  editor.setValue(
    "ΠΡΟΓΡΑΜΜΑ Άσκηση\n\nΜΕΤΑΒΛΗΤΕΣ\nΑΚΕΡΑΙΕΣ: α\n\nΑΡΧΗ\n\nΓΙΑ α ΑΠΟ 1 ΜΕΧΡΙ 10\n  ΓΡΑΨΕ 'Καλημέρα κόσμε', α\nΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ\n\nΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ\n"
  );
  editor.clearSelection();




  $("#run").click(function (e) {
    e.preventDefault();

    editor.setReadOnly(true);

    $("#spinner").show();

    $("#run").addClass("disabled");
    $("#run").prop("disabled", true);

    $(".btnShowOutput").click();

    $("#result").html("Περιμένετε....");
    $("#resultDetails").html("Περιμένετε....");

    $("#error").html("").hide();

    var editorCode = editor.getValue();

    var output1 = null;
    var output2 = null;
    try {
      var app = new GLO.GlossaJS();
      app.setSourceCode(editorCode);
      
      if ($("#codekeyboardinput").val() != "")
        app.setInputBuffer($("#codekeyboardinput").val());
        app.run();
        output1 = app.getOutput();
        output2 = app.getOutputDetails();
      } catch (e) {
      output1 = e.message;
      output2 = e.message;
    }

    $("#spinner").hide();

    $("#result").html(output1);
    $("#resultDetails").html(output2);

    $("#run").removeClass("disabled");
    $("#run").prop("disabled", false);

    editor.setReadOnly(false);

    $("#resultpre").animate(
      {
        scrollTop: $("#resultpre").get(0).scrollHeight,
      },
      400
    );
  });
});
