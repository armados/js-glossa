var gloObjectsID = [];
var gloObjectsAPP = [];

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
    html += '<td scope="row" class="tdid">' + rec.id + "</td>";
    html += '<td class="tdvalue">';
    if (rec.value != null) html += rec.value;
    html += "</td>";
    html += '<td class="tdtype">' + rec.description + "</td>";
    html += "</tr>";
  }

  html += "</tbody>";
  html += "</table>";

  return html;
}

async function startProgramExecution(gloBoxID, runstep) {
  var editorid = $("#" + gloBoxID)
    .find(".gloAceEditor")
    .attr("id");
  var aceeditor = ace.edit(editorid);


  // beautify
  var beautify = ace.require("ace/ext/beautify");
  const session = aceeditor.getSession();
  beautify.beautify(session);
  // beautify end

  var sourcecode = aceeditor.getValue();

  var inputdata = $("#" + gloBoxID)
    .find(".gloCodeKeyboardInput")
    .val();

  var slowrun = $("#" + gloBoxID)
    .find(".gloSlowRun")
    .is(":checked");

  var breakpointsArray = aceeditor.session.getBreakpoints();

  var app = getGlossaApp(gloBoxID);
  app.init();

  app.setSourceCode(sourcecode);
  app.setInputBuffer(inputdata);

  app.setDebugMode(true);

  app.setReadInputFunction(function (name) {
    return prompt("Εισαγωγή τιμής στο αναγνωριστικό " + name);
  });

  app.setSlowRun(slowrun);
  app.setStepRun(runstep);

  for (var line in breakpointsArray) app.addBreakpoint(Number(line) + 1);

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

  $("#" + gloBoxID).addClass("running");
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

  $("#" + gloBoxID).removeClass("paused");
}

function UIStatePaused(gloBoxID) {
  $("#" + gloBoxID)
    .find(".gloRun i")
    .removeClass("fa-pause")
    .addClass("fa-play");

  $("#" + gloBoxID).addClass("paused");
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

  aceeditor.setReadOnly(false);

  $("#" + gloBoxID)
    .removeClass("running")
    .removeClass("paused");

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
        app.runNextStatement();
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
      } else if (!app.runIsPaused()) {
        app.runPause();
      } else {
        app.runContinue();
      }
    });

  $(this)
    .find(".gloStop")
    .click(function (e) {
      e.preventDefault();

      var gloBoxID = $(this).closest(".gloBox").attr("id");

      var app = getGlossaApp(gloBoxID);

      app.terminate();
    });

  $(this)
    .find(".gloSlowRun")
    .click(function (e) {
      var gloBoxID = $(this).closest(".gloBox").attr("id");

      var app = getGlossaApp(gloBoxID);

      if (!app.isrunning()) return;

      if ($(this).is(":checked")) {
        app.setSlowRun(true);
      } else {
        app.setSlowRun(false);
      }
    });

  $(".gloBox").each(function (index) {
    var gloBoxID = $(this).attr("id");

    var randomID = Math.floor(Math.random() * 1000000 + 1);

    if (typeof gloBoxID === "undefined") {
      gloBoxID = "gloBoxID" + randomID;
      $(this).attr("id", gloBoxID);
    }


    $(this)
      .find(".gloAceEditor")
      .attr("id", "gloAceEditorID" + randomID);

    var editor = ace.edit("gloAceEditorID" + randomID);
    editor.renderer.setDisplayIndentGuides(true);
    editor.renderer.setShowPrintMargin(false);
    editor.renderer.setShowGutter(true);
    editor.setHighlightActiveLine(true);
    editor.clearSelection();
    require("ace/config").setModuleUrl(
      "ace/theme/gruvbox",
      "https://ajaxorg.github.io/ace-builds/src/theme-gruvbox.js"
    );
    editor.setTheme("ace/theme/gruvbox");

    require("ace/config").setModuleUrl("ace/mode/glossa", "acemodeglo.js");
    editor.session.setMode("ace/mode/glossa");

    var cookieData = Cookies.get("editorSourceCode");

    const mycode = `ΠΡΟΓΡΑΜΜΑ Άσκηση

ΜΕΤΑΒΛΗΤΕΣ
  ΑΚΕΡΑΙΕΣ: α, β

ΑΡΧΗ
  ΓΡΑΨΕ Α_Μ(9.3), Α_Τ(-100), Τ_Ρ(9) 

  ΓΡΑΨΕ 'Καλημέρα'

  ΓΡΑΨΕ 'Δωσε τιμή:'
  ΔΙΑΒΑΣΕ α
  ΓΡΑΨΕ 'Έδωσες τον αριθμό ', α

  ΓΙΑ β ΑΠΟ 1 ΜΕΧΡΙ α
    ΓΡΑΨΕ 'Καλημέρα κόσμε', β
  ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ

ΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ`;

    if (typeof cookieData !== "undefined" && cookieData != "")
      editor.setValue(cookieData);
    else editor.setValue(mycode);

    editor.clearSelection();

    Cookies.set("editorSourceCode", editor.getValue());

    editor.getSession().on("change", function () {
      Cookies.set("editorSourceCode", editor.getValue());
    });

    editor.on("guttermousedown", function (e) {
      var target = e.domEvent.target;

      if (target.className.indexOf("ace_gutter-cell") == -1) {
        return;
      }

      if (!editor.isFocused()) {
        return;
      }

      if (e.clientX > 25 + target.getBoundingClientRect().left) {
        return;
      }

      var breakpoints = e.editor.session.getBreakpoints(row, 0);
      var row = e.getDocumentPosition().row;

      // If there's a breakpoint already defined, it should be removed, offering the toggle feature
      if (typeof breakpoints[row] === typeof undefined) {
        e.editor.session.setBreakpoint(row);
      } else {
        e.editor.session.clearBreakpoint(row);
      }

      e.stop();
    });

    editor.on("change", function (e) {
      var breakpointsArray = editor.session.getBreakpoints();
      if (Object.keys(editor.session.getBreakpoints()).length > 0) {
        if (e.lines.length > 1) {
          var breakpoint = parseInt(Object.keys(breakpointsArray)[0]);
          var lines = e.lines.length - 1;
          var start = e.start.row;
          var end = e.end.row;
          if (e.action === "insert") {
            //console.log('new lines',breakpoint, start , end );
            if (breakpoint > start) {
              //console.log('breakpoint forward');
              editor.session.clearBreakpoint(breakpoint);
              editor.session.setBreakpoint(breakpoint + lines);
            }
          } else if (e.action === "remove") {
            //console.log('removed lines',breakpoint, start , end);
            if (breakpoint > start && breakpoint < end) {
              //console.log('breakpoint remove');
              editor.session.clearBreakpoint(breakpoint);
            }
            if (breakpoint >= end) {
              //console.log('breakpoint behind');
              editor.session.clearBreakpoint(breakpoint);
              editor.session.setBreakpoint(breakpoint - lines);
            }
          }
        }
      }
    });

    var app = newGlossaApp(gloBoxID);

    app.on("started", () => {
      UIStateStarted(gloBoxID);
    });
    app.on("stopped", (data) => {
      UIStateStopped(gloBoxID, data);
    });
    app.on("finished", () => {
      UIStateFinished(gloBoxID);
    });
    app.on("error", (data) => {
      UIStateError(gloBoxID, data);
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
    app.on("reachbreakpoint", (data) => {
      UIStateUpdateCodeLine(gloBoxID, data);
    });
  });
});
