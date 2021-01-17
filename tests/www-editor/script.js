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
  .addClass("running");

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

function UIStateContinueRunning(gloBoxID) {
  $("#" + gloBoxID)
    .find(".gloRun i")
    .removeClass("fa-play")
    .addClass("fa-pause");
}

function UIStatePaused(gloBoxID) {
  $("#" + gloBoxID)
    .find(".gloRun i")
    .removeClass("fa-pause")
    .addClass("fa-play");
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
  .removeClass("running");

  $("#" + gloBoxID)
    .find(".gloSpinner")
    .hide();

  $("#" + gloBoxID)
    .find(".gloRun i")
    .removeClass("fa-pause")
    .addClass("fa-play");

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
        if (app.isPaused() == true) {
          app.runContinue();
        } else {
          app.runPause();
        }
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

    const mycode = `!Το πρόγραμμα αυτό επιδεικνύει την προτεραιότητα των τελεστών.
!Οι κανόνες προτεραιότητας από τον υψηλότερο στον χαμηλότερο:
!  8. Αναγνωριστικά, σταθερές, συναρτήσεις, παρενθέσεις
!  7. ^
!  6. πρόσημα -, +
!  5. *, /, div, mod
!  4. δυαδικοί τελεστές +, -,
!  3. < , <=, =, <>, >, >=
!  2. όχι
!  1. και
!  0. ή
ΠΡΟΓΡΑΜΜΑ ΠροτεραιότηταΤελεστών
ΑΡΧΗ
!Τα *, /, div, mod εκτελούνται από αριστερά προς δεξιά:
  ΓΡΑΨΕ 4/3/2                                           !(4/3)/2
!Η δύναμη αποτιμάται από αριστερά προς τα δεξιά, εκτός κι αν
!το ρυθμίσετε διαφορετικά από τις επιλογές του Διερμηνευτή.
  ΓΡΑΨΕ 4^3^2                                           !(4^3)^2
!Η δύναμη έχει μεγαλύτερη προτεραιότητα από τα πρόσημα:
  ΓΡΑΨΕ -2^-2                                         !-(2^(-2))
!Το και έχει μεγαλύτερη προτεραιότητα από το ή:
  ΓΡΑΨΕ ΑΛΗΘΗΣ Η ΑΛΗΘΗΣ ΚΑΙ ΨΕΥΔΗΣ                !Α ή (Α και Ψ)
!Το = έχει μεγαλύτερη προτεραιότητα από το όχι:
  ΓΡΑΨΕ 1 = 2 = ΟΧΙ ΑΛΗΘΗΣ = ΨΕΥΔΗΣ       !(1 = 2) = όχι (Α = Ψ)
ΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ 

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
    app.on("paused", () => {
      UIStatePaused(gloBoxID);
    });
    app.on("continuerunning", () => {
      UIStateContinueRunning(gloBoxID);
    });
  });
});
