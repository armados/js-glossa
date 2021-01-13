// =================================

var gloObjectsID = [];
var gloObjectsAPP = [];

// =================================

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

// ==============================

async function startProgramExecution(gloBoxID, runstep) {
  var editorid = $("#" + gloBoxID)
    .find(".gloAceEditor")
    .attr("id");
  var aceeditor = ace.edit(editorid);

  var sourcecode = aceeditor.getValue();

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

// ======================================

function UIStateStarted(gloBoxID) {
  var editorid = $("#" + gloBoxID)
    .find(".gloAceEditor")
    .attr("id");
  var aceeditor = ace.edit(editorid);

  aceeditor.setReadOnly(true);

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
  var editorid = $("#" + gloBoxID)
    .find(".gloAceEditor")
    .attr("id");
  var aceeditor = ace.edit(editorid);

  aceeditor.setHighlightActiveLine(false);
  aceeditor.setReadOnly(false);

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
  var editorid = $("#" + gloBoxID)
    .find(".gloAceEditor")
    .attr("id");
  var aceeditor = ace.edit(editorid);

  aceeditor.setHighlightActiveLine(true);
  aceeditor.gotoLine(line);
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

    var app = newGlossaApp(gloBoxID);

    var randomID = Math.floor(Math.random() * 1000000 + 1);
    $(this)
      .find(".gloAceEditor")
      .attr("id", "gloAceEditorID" + randomID);

    var editor = ace.edit("gloAceEditorID" + randomID);
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

    if (typeof cookieData !== "undefined" && cookieData != "")
      editor.setValue(cookieData);
    else editor.setValue(mycode);

    editor.clearSelection();

    Cookies.set("editorSourceCode", editor.getValue());

    editor.getSession().on("change", function () {
      Cookies.set("editorSourceCode", editor.getValue());
    });

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
