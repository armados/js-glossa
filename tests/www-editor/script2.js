// =================================

var gloObjectsID = [];
var gloObjectsAPP = [];

// =================================
var glossaConf2 = {
  keywords: [
    "ΠΡΟΓΡΑΜΜΑ",
    "ΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ",
    "ΣΤΑΘΕΡΕΣ",
    "ΜΕΤΑΒΛΗΤΕΣ",
    "ΑΡΧΗ",
    "ΣΥΝΑΡΤΗΣΗ",
    "ΤΕΛΟΣ_ΣΥΝΑΡΤΗΣΗΣ",
    "ΔΙΑΔΙΚΑΣΙΑ",
    "ΤΕΛΟΣ_ΔΙΑΔΙΚΑΣΙΑΣ",
    "ΓΡΑΨΕ",
    "ΔΙΑΒΑΣΕ",
    "ΑΝ",
    "ΤΟΤΕ",
    "ΑΛΛΙΩΣ_ΑΝ",
    "ΑΛΛΙΩΣ",
    "ΤΕΛΟΣ_ΑΝ",
    "ΟΣΟ",
    "ΕΠΑΝΑΛΑΒΕ",
    "ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ",
    "ΑΡΧΗ_ΕΠΑΝΑΛΗΨΗΣ",
    "ΜΕΧΡΙΣ_ΟΤΟΥ",
    "ΓΙΑ",
    "ΑΠΟ",
    "ΜΕΧΡΙ",
    "ΜΕ ΒΗΜΑ",
    "ΜΕ_ΒΗΜΑ",
    "ΚΑΛΕΣΕ",
    "ΕΠΙΛΕΞΕ",
    "ΠΕΡΙΠΡΩΣΗ",
    "ΠΕΡΙΠΤΩΣΗ ΑΛΛΙΩΣ",
    "ΤΕΛΟΣ_ΕΠΙΛΟΓΩΝ",
    "KAI",
    "ΚΑΊ",
    "Η",
    "Ή",
    "ΌΧΙ",
    "ΟΧΙ",
  ],

  builtinFunctions: ["Α_Μ", "Α_Τ", "Τ_Ρ", "ΗΜ", "ΣΥΝ", "ΕΦ", "Ε", "ΛΟΓ"],

  typeKeywords: [
    "ΑΛΗΘΗΣ",
    "ΨΕΥΔΗΣ",
    "ΑΚΕΡΑΙΕΣ",
    "ΠΡΑΓΜΑΤΙΚΕΣ",
    "ΧΑΡΑΚΤΗΡΕΣ",
    "ΠΡΑΓΜΑΤΙΚΕΣ",
    "ΑΚΕΡΑΙΑ",
    "ΠΡΑΓΜΑΤΙΚΗ",
    "ΧΑΡΑΚΤΗΡΑΣ",
    "ΛΟΓΙΚΗ",
  ],

  operators: [
    "^",
    "*",
    "/",
    "DIV",
    "MOD",
    "+",
    "-",
    "=",
    ">",
    "<",
    "!",
    ":",
    "<=",
    ">=",
    "<>",
  ],

  // we include these common regular expressions
  symbols: /[=><!:&+\-*\/\^]+/,

  // C# style strings
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      // identifiers and keywords
      [
        /[Ά-Ώά-ώΑ-Ωα-ωA-Za-z$][Ά-Ώά-ώΑ-Ωα-ωA-Za-z0-9_$]*/,
        {
          cases: {
            "@typeKeywords": "keyword",
            "@keywords": "keyword",
            "@builtinFunctions": "variable.predefined",
            "@default": "identifier",
          },
        },
      ],
      //[/[A-Z][\w\$]*/, 'type.identifier' ],  // to show class names nicely

      // whitespace
      { include: "@whitespace" },

      // delimiters and operators
      [/[{}()\[\]]/, "@brackets"],
      //[/[<>](?!@symbols)/, "@brackets"],
      [/@symbols/, { cases: { "@operators": "operator", "@default": "" } }],

      // numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
      [/0[xX][0-9a-fA-F]+/, "number.hex"],
      [/\d+/, "number"],

      // delimiter: after number because of .\d floats
      [/[;,.]/, "delimiter"],

      // strings
      [/"([^"\\]|\\.)*$/, "string.invalid"], // non-teminated string
      [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

      // characters
     // [/'[^\\']'/, "string"],
     // [/(')(@escapes)(')/, ["string", "string.escape", "string"]],
     // [/'/, "string.invalid"],
    ],



    string: [
      [/[^\\"]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
    ],

    whitespace: [
      [/[ \t\r\n]+/, "white"],
      [/!.*$/, "comment"],
    ],
  },
};

var glossaConf = {
  defaultToken: "",
  tokenPostfix: ".glo",
  ignoreCase: true,
  brackets: [
    { open: "{", close: "}", token: "delimiter.curly" },
    { open: "[", close: "]", token: "delimiter.square" },
    { open: "(", close: ")", token: "delimiter.parenthesis" },
    { open: "<", close: ">", token: "delimiter.angle" },
  ],
  brackets2: /[{}()\[\]]/,
  keywords: [
    "ΠΡΟΓΡΑΜΜΑ",
    "ΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ",
    "ΣΤΑΘΕΡΕΣ",
    "ΜΕΤΑΒΛΗΤΕΣ",
    "ΑΡΧΗ",
    "ΣΥΝΑΡΤΗΣΗ",
    "ΤΕΛΟΣ_ΣΥΝΑΡΤΗΣΗΣ",
    "ΔΙΑΔΙΚΑΣΙΑ",
    "ΤΕΛΟΣ_ΔΙΑΔΙΚΑΣΙΑΣ",
    "ΓΡΑΨΕ",
    "ΔΙΑΒΑΣΕ",
    "ΑΝ",
    "ΤΟΤΕ",
    "ΑΛΛΙΩΣ_ΑΝ",
    "ΑΛΛΙΩΣ",
    "ΤΕΛΟΣ_ΑΝ",
    "ΟΣΟ",
    "ΕΠΑΝΑΛΑΒΕ",
    "ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ",
    "ΑΡΧΗ_ΕΠΑΝΑΛΗΨΗΣ",
    "ΜΕΧΡΙΣ_ΟΤΟΥ",
    "ΓΙΑ",
    "ΑΠΟ",
    "ΜΕΧΡΙ",
    "ΜΕ ΒΗΜΑ",
    "ΜΕ_ΒΗΜΑ",
    "ΚΑΛΕΣΕ",
    "ΕΠΙΛΕΞΕ",
    "ΠΕΡΙΠΡΩΣΗ",
    "ΠΕΡΙΠΤΩΣΗ ΑΛΛΙΩΣ",
    "ΤΕΛΟΣ_ΕΠΙΛΟΓΩΝ",
    "ΑΛΗΘΗΣ",
    "ΨΕΥΔΗΣ",
    "ΑΚΕΡΑΙΕΣ",
    "ΠΡΑΓΜΑΤΙΚΕΣ",
    "ΧΑΡΑΚΤΗΡΕΣ",
    "ΠΡΑΓΜΑΤΙΚΕΣ",
    "ΑΚΕΡΑΙΑ",
    "ΠΡΑΓΜΑΤΙΚΗ",
    "ΧΑΡΑΚΤΗΡΑΣ",
    "ΛΟΓΙΚΗ",
    "KAI",
    "ΚΑΊ",
    "Η",
    "Ή",
    "ΌΧΙ",
    "ΟΧΙ",
    "DIV",
    "MOD",
  ],
  builtinFunctions: ["Α_Μ", "Α_Τ", "Τ_Ρ", "ΗΜ", "ΣΥΝ", "ΕΦ", "Ε", "ΛΟΓ"],
  operators: [
    "=",
    ">",
    "<",
    "<=",
    ">=",
    "<>",
    ":",
    "<-",
    "+",
    "-",
    "*",
    "/",
    "^",
  ],
  // we include these common regular expressions
  symbols: /[=><:@\^&|+\-*\/\^%]+/,
  // The main tokenizer for our languages
  tokenizer: {
    root: [
      // identifiers and keywords
      [
        /[Ά-Ώά-ώΑ-Ωα-ωA-Za-z$][Ά-Ώά-ώΑ-Ωα-ωA-Za-z0-9_$]*/,
        {
          cases: {
            "@keywords": "keyword",
            "@builtinFunctions": "variable.predefined",
            "@default": "identifier",
          },
        },
      ],
      // whitespace
      { include: "@whitespace" },
      // delimiters and operators
      //[/[{}()\[\]]/, '@brackets'],
      //[/[<>](?!@symbols)/, '@brackets'],

      [/@brackets2/, "keyword.flow"],

      [/@symbols/, "type"],

      // numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
      [/\$[0-9a-fA-F]{1,16}/, "number.hex"],
      [/\d+/, "number"],
      // strings
      [/'([^'\\]|\\.)*$/, "string.invalid"],
      [/'/, "string", "@string"],
      // characters
      [/'[^\\']'/, "string"],
      [/'/, "string.invalid"],
      [/\#\d+/, "string"],
    ],
    comment: [
      //[/[^\*\}]+/, 'comment'],
      //[/\(\*/,    'comment', '@push' ],    // nested comment  not allowed :-(
    ],
    string: [
      [/[^\\']+/, "string"],
      [/\\./, "string.escape.invalid"],
      [/'/, { token: "string.quote", bracket: "@close", next: "@pop" }],
    ],
    whitespace: [
      [/[ \t\r\n]+/, "white"],
      [/!.*$/, "comment"],
    ],
  },
};

function newGlossaApp(id) {
  const index = gloObjectsID.indexOf(id);
  if (index >= 0) return false;

  var app = new GLO.GlossaJS();
  gloObjectsID.push(id);
  gloObjectsAPP.push(app);
  return app;
}

function getGlossaApp(id) {
  const index = gloObjectsID.indexOf(id);
  return index >= 0 ? gloObjectsAPP[index] : false;
}

// =================================

var editorsArr = [];
var decorations = [];

function renderMemory(data) {
  var html = '<table class="table table-sm table-borderless">';
  html += "<thead>";
  html += '<tr class="bg-info">';
  html += '<td scope="col">Όνομα</td>';
  html += '<td scope="col">Τιμή</td>';
  html += '<td scope="col">Τύπος</td>';
  html += "</tr>";
  html += "</thead>";
  html += "<tbody>";

  for (const rec of data) {
    html += "<tr>";
    html += '<td scope="row">' + rec.id + "</td>";
    html += "<td>";
    if (rec.value != null) html += rec.value;
    html += "</td>";
    html += "<td>" + rec.description + "</td>";
    html += "</tr>";
  }

  html += "</tbody>";
  html += "</table>";

  return html;
}

function UIStateStarted(gloBoxID) {
  var editorInstance = editorsArr[0];
  editorInstance.updateOptions({ readOnly: true });

  $("#" + gloBoxID)
    .find(".gloSpinner")
    .show();

  $("#" + gloBoxID)
    .find(".gloStop")
    .removeClass("disabled");

  $("#" + gloBoxID)
    .find(".gloStop")
    .prop("disabled", false);

  $("#" + gloBoxID)
    .find(".gloBtnShowOutput")
    .click();

  $("#" + gloBoxID)
    .find(".gloResult")
    .html("");

  $("#" + gloBoxID)
    .find(".gloResultDetails")
    .html("");

  $("#" + gloBoxID)
    .find(".gloMemory")
    .html("");
}

function UIStateError(gloBoxID, msg) {
  $("#" + gloBoxID)
    .find(".gloResult")
    .html(function (index, value) {
      return value + '<span class="errorMsg">' + msg + "</span>\n";
    });

  var textBox = $("#" + gloBoxID).find(".gloResultPre");
  textBox.scrollTop(textBox[0].scrollHeight);

  $("#" + gloBoxID)
    .find(".gloResultDetails")
    .html(function (index, value) {
      return value + '<span class="errorMsg">' + msg + "</span>\n";
    });
}

function UIStateInputRead(gloBoxID, msg) {
  $("#" + gloBoxID)
    .find(".gloResult")
    .html(function (index, value) {
      return value + '<span class="readValue">' + msg + "</span>\n";
    });

  var textBox = $("#" + gloBoxID).find(".gloResultPre");
  textBox.scrollTop(textBox[0].scrollHeight);
}

function UIStateStopped(gloBoxID, msg) {
  $("#" + gloBoxID)
    .find(".gloResult")
    .html(function (index, value) {
      return value + '<span class="noticeMsg">' + msg + "</span>\n";
    });

  var textBox = $("#" + gloBoxID).find(".gloResultPre");
  textBox.scrollTop(textBox[0].scrollHeight);

  $("#" + gloBoxID)
    .find(".gloResultDetails")
    .html(function (index, value) {
      return value + '<span class="noticeMsg">' + msg + "</span>\n";
    });
}

function UIStateFinished(gloBoxID) {
  var editorInstance = editorsArr[0];
  editorInstance.updateOptions({ readOnly: false });

  decorations = editorInstance.deltaDecorations(decorations, []);

  $("#" + gloBoxID)
    .find(".gloSpinner")
    .hide();

  $("#" + gloBoxID)
    .find(".gloStop")
    .addClass("disabled");

  $("#" + gloBoxID)
    .find(".gloStop")
    .prop("disabled", true);
}

function UIStateUpdateCodeLine(gloBoxID, line) {
  var editorInstance = editorsArr[0];

  editorInstance.revealLine(line);

  decorations = editorInstance.deltaDecorations(decorations, [
    {
      range: new monaco.Range(line, 1, line, 1),
      options: {
        isWholeLine: true,
        className: "myContentClass",
        glyphMarginClassName: "myGlyphMarginClass",
      },
    },
  ]);

  //console.log(decorations);
}

function UIStateUpdateMemory(gloBoxID, data) {
  $("#" + gloBoxID)
    .find(".gloMemory")
    .html(renderMemory(data));
}

function UIStateOutputAppend(gloBoxID, data) {
  $("#" + gloBoxID)
    .find(".gloResult")
    .html(function (index, value) {
      return value + data + "\n";
    });

  var textBox = $("#" + gloBoxID).find(".gloResultPre");
  textBox.scrollTop(textBox[0].scrollHeight);
}

function UIStateOutputDetailsAppend(gloBoxID, data) {
  $("#" + gloBoxID)
    .find(".gloResultDetails")
    .html(function (index, value) {
      return value + data + "\n";
    });
}

// ==============================

async function startProgramExecution(gloBoxID, runstep) {
  var editor = editorsArr[0];

  var sourcecode = editor.getValue();

  var inputdata = $("#" + gloBoxID)
    .find(".gloCodeKeyboardInput")
    .val();

  var slowrun = $("#" + gloBoxID)
    .find(".gloSlowRun")
    .is(":checked");

  var app = getGlossaApp(gloBoxID);
  app.init();
  app.setDebugMode(true);
  app.setReadInputFunction(function (name) {
    var value = prompt("Εισαγωγή τιμής στο αναγνωριστικό " + name);
    return value;
  });
  app.setSourceCode(sourcecode);
  app.setInputBuffer(inputdata);
  app.setSlowRun(slowrun);
  app.setStepRun(runstep);
  app.run();
}

function UIStateOutputDetailsAppend(gloBoxID, data) {
  $("#" + gloBoxID)
    .find(".gloResultDetails")
    .html(function (index, value) {
      return value + data + "\n";
    });
}

// ==============================

// ==============================

$(document).ready(function () {
  $(".gloSpinner").hide();

  $(".gloBtnShowInput").click(function (e) {
    e.preventDefault();
    $(this).closest(".gloBox").find(".gloOutputTab").hide();
    $(this).closest(".gloBox").find(".gloOutputTabDetails").hide();
    $(this).closest(".gloBox").find(".gloInputTab").show();
  });

  $(".gloBtnShowOutput").click(function (e) {
    e.preventDefault();
    $(this).closest(".gloBox").find(".gloInputTab").hide();
    $(this).closest(".gloBox").find(".gloOutputTab").show();
    $(this).closest(".gloBox").find(".gloOutputTabDetails").hide();
  });

  $(".gloBtnShowOutputDetails").click(function (e) {
    e.preventDefault();
    $(this).closest(".gloBox").find(".gloInputTab").hide();
    $(this).closest(".gloBox").find(".gloOutputTab").hide();
    $(this).closest(".gloBox").find(".gloOutputTabDetails").show();
  });

  $(this)
    .find(".gloRunStep")
    .click(function (e) {
      e.preventDefault();

      var gloBoxID = $(this).closest(".gloBox").attr("id");

      var app = getGlossaApp(gloBoxID);

      if (!app.isrunning()) {
        startProgramExecution(gloBoxID, true);
      } else {
        app.runNext();
      }
    });

  $(this)
    .find(".gloRun")
    .click(function (e) {
      e.preventDefault();

      var gloBoxID = $(this).closest(".gloBox").attr("id");

      var app = getGlossaApp(gloBoxID);

      if (!app.isrunning()) {
        startProgramExecution(gloBoxID, false);
      } else {
        app.setStepRun(false);
      }
    });

  $(this)
    .find(".gloStop")
    .click(function (e) {
      e.preventDefault();

      var gloBoxID = $(this).closest(".gloBox").attr("id");

      var app = getGlossaApp(gloBoxID);

      app.runNext();
      app.terminate();
    });

  $(".gloBox").each(function (index) {
    var gloBoxID = $(this).attr("id");

    if (typeof gloBoxID === "undefined") {
      gloBoxID = "gloBoxID" + randomID;
      $(this).attr("id", gloBoxID);
    }

    var randomID = Math.floor(Math.random() * 1000000 + 1);
    $(this)
      .find(".gloAceEditor")
      .attr("id", "gloAceEditorID" + randomID);

    // Based on https://jsfiddle.net/developit/bwgkr6uq/ which just works but is based on unpkg.com.
    // Provided by loader.min.js.
    require.config({
      paths: {
        vs:
          "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.21.2/min/vs",
      },
    });
    window.MonacoEnvironment = { getWorkerUrl: () => proxy };
    let proxy = URL.createObjectURL(
      new Blob(
        [
          `
            self.MonacoEnvironment = {
                baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.21.2/min'
            };
            importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.21.2/min/vs/base/worker/workerMain.min.js');
        `,
        ],
        { type: "text/javascript" }
      )
    );

    require(["vs/editor/editor.main"], function () {
      monaco.languages.register({ id: "glossa" });
      monaco.languages.setMonarchTokensProvider("glossa", glossaConf2);

      let editor = monaco.editor.create($(".gloAceEditor")[0], {
        value: "",
        language: "pascal",
        scrollBeyondLastLine: true,
        readOnly: false,
        lineNumbers: "on",
        glyphMargin: true,
        folding: false,
        //fontFamily: "Arial",
        //fontSize: 20,
        theme: "vs-dark",
        language: "glossa",
        //fixedOverflowWidgets: true,
        //automaticLayout: true
      });

      const mycode = `
      ΠΡΟΓΡΑΜΜΑ Στατιστική
      ΜΕΤΑΒΛΗΤΕΣ
        ΑΚΕΡΑΙΕΣ: Ι, Πλήθος, Στοιχεία[100], Μέγιστο, Άθροισμα, Άθροισμα_2, Βοηθητική
        ΠΡΑΓΜΑΤΙΚΕΣ: ΜΟ, Τυπ_Απόκλιση, Διάμεσος
      ΑΡΧΗ
      ! Εισαγωγή στοιχείων
        ΓΡΑΨΕ 'Δώσε το πλήθος των αριθμών (μέγιστο 100)', Α_Μ(9.3), Α_Τ(-100),Τ_Ρ(9)
        ΔΙΑΒΑΣΕ Πλήθος
        ΓΙΑ Ι ΑΠΟ 1 ΜΕΧΡΙ Πλήθος
          ΓΡΑΨΕ 'Δώσε έναν αριθμό'
          ΔΙΑΒΑΣΕ Στοιχεία[Ι] 
        ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ
        ΚΑΛΕΣΕ Υπολόγισε_ΜΟ_ΤυπΑπ(Στοιχεία, Πλήθος, ΜΟ, Τυπ_Απόκλιση) 
        ΚΑΛΕΣΕ Ταξινόμησε(Στοιχεία, Πλήθος) 
        Διάμεσος <- Υπολογισμός_Διαμέσου(Στοιχεία, Πλήθος) 
      ! Εκτύπωση αποτελεσμάτων
        ΓΡΑΨΕ 'ΑΠΟΤΕΛΕΣΜΑΤΑ ΓΙΑ ΤΟΥΣ ', Πλήθος, 'ΑΡΙΘΜΟΥΣ'
        ΓΡΑΨΕ 'ΜΕΣΟΣ ΟΡΟΣ:', ΜΟ
        ΓΡΑΨΕ 'ΤΥΠΙΚΗ ΑΠΟΚΛΙΣΗ: ', Τυπ_Απόκλιση
        ΓΡΑΨΕ 'ΔΙΑΜΕΣΟΣ:', Διάμεσος
      ΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ
      
      
      ΔΙΑΔΙΚΑΣΙΑ Υπολόγισε_ΜΟ_ΤυπΑπ(Πίνακας, Ν, ΜΟ, ΤυπΑποκλ) 
      ! Υπολογισμός μέσου όρου
      !Υπολογισμός τυπικής απόκλισης
      ΜΕΤΑΒΛΗΤΕΣ
        ΑΚΕΡΑΙΕΣ: Πίνακας[100], Ν, Ι, Άθροισμα, Άθροισμα_2
        ΠΡΑΓΜΑΤΙΚΕΣ: ΜΟ, ΤυπΑποκλ
      ΑΡΧΗ
        Άθροισμα <- 0
        Άθροισμα_2 <- 0
        ΓΙΑ Ι ΑΠΟ 1 ΜΕΧΡΙ Ν
          Άθροισμα <- Άθροισμα + Πίνακας[Ι] 
          Άθροισμα_2 <- Άθροισμα_2 + Πίνακας[Ι]^2
        ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ
        ΜΟ <- Άθροισμα/Ν
        ΤυπΑποκλ <- Τ_Ρ(Άθροισμα_2/ Ν - ΜΟ^2) 
      ΤΕΛΟΣ_ΔΙΑΔΙΚΑΣΙΑΣ
      
      ΔΙΑΔΙΚΑΣΙΑ Ταξινόμησε(Πίνακας, Ν) 
      !Ταξινόμηση των στοιχείων του πίνακα
      ΜΕΤΑΒΛΗΤΕΣ
        ΑΚΕΡΑΙΕΣ: I, Ν1, Τ, Βοηθητική, Πίνακας[100], Ν
      ΑΡΧΗ
        Ν1 <- Ν
        ΑΡΧΗ_ΕΠΑΝΑΛΗΨΗΣ
          Τ <- 0
          ΓΙΑ I ΑΠΟ 1 ΜΕΧΡΙ Ν1 - 1
            ΑΝ Πίνακας[I] > Πίνακας[I + 1] ΤΟΤΕ
              Βοηθητική <- Πίνακας[I] 
              Πίνακας[I] <- Πίνακας[I + 1] 
              Πίνακας[I + 1] <- Βοηθητική
              Τ <- I
            ΤΕΛΟΣ_ΑΝ
          ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ
          Ν1 <- Τ
        ΜΕΧΡΙΣ_ΟΤΟΥ Τ = 0
      ΤΕΛΟΣ_ΔΙΑΔΙΚΑΣΙΑΣ
      
      ΣΥΝΑΡΤΗΣΗ Υπολογισμός_Διαμέσου(Α, Ν): ΠΡΑΓΜΑΤΙΚΗ
      ΜΕΤΑΒΛΗΤΕΣ
        ΑΚΕΡΑΙΕΣ: Α[100], Ν
      ΑΡΧΗ
        ΑΝ Ν mod 2 = 0 ΤΟΤΕ
          Υπολογισμός_Διαμέσου <- (Α[Α_Μ(Ν/2)] + Α[Α_Μ(Ν/2) + 1])/2
        ΑΛΛΙΩΣ
          Υπολογισμός_Διαμέσου <- Α[Α_Μ((Ν + 1)/2)] 
        ΤΕΛΟΣ_ΑΝ
      ΤΕΛΟΣ_ΣΥΝΑΡΤΗΣΗΣ
      
      `;

      editor.setValue(mycode);

      editorsArr.push(editor);
    });

    var app = newGlossaApp(gloBoxID);

    /*
    editor.renderer.setDisplayIndentGuides(true);
    editor.renderer.setShowPrintMargin(false);
    editor.renderer.setShowGutter(true);
    editor.setHighlightActiveLine(false);
    editor.clearSelection();
    require("ace/config").setModuleUrl(
      "ace/theme/gruvbox",
      "https://ajaxorg.github.io/ace-builds/src/theme-gruvbox.js"
    );
    editor.setTheme("ace/theme/gruvbox");

    require("ace/config").setModuleUrl("ace/mode/glossa", "acemodeglo.js");
    editor.session.setMode("ace/mode/glossa");

    var cookieData = Cookies.get("editorSourceCode");

    if (typeof cookieData !== "undefined" && cookieData != "")
      editor.setValue(cookieData);
    else
      editor.setValue(
        "ΠΡΟΓΡΑΜΜΑ Άσκηση\n\nΜΕΤΑΒΛΗΤΕΣ\nΑΚΕΡΑΙΕΣ: α\n\nΑΡΧΗ\n\nΓΙΑ α ΑΠΟ 1 ΜΕΧΡΙ 700\n  ΓΡΑΨΕ 'Καλημέρα κόσμε', α\nΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ\n\nΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ\n"
      );

    editor.clearSelection();

    Cookies.set("editorSourceCode", editor.getValue());

    editor.getSession().on("change", function () {
      Cookies.set("editorSourceCode", editor.getValue());
    });

    */

    app.on("started", () => {
      UIStateStarted(gloBoxID);
    });
    app.on("stopped", (msg) => {
      UIStateStopped(gloBoxID, msg);
    });
    app.on("finished", () => {
      UIStateFinished(gloBoxID);
    });
    app.on("error", (msg) => {
      UIStateError(gloBoxID, msg);
    });
    app.on("line", (data) => {
      UIStateUpdateCodeLine(gloBoxID, data);
    });
    app.on("memory", (data) => {
      UIStateUpdateMemory(gloBoxID, data);
    });
    app.on("outputappend", (data) => {
      UIStateOutputAppend(gloBoxID, data);
    });
    app.on("outputdetailsappend", (data) => {
      UIStateOutputDetailsAppend(gloBoxID, data);
    });
    app.on("inputread", (data) => {
      UIStateInputRead(gloBoxID, data);
    });
  });
});
