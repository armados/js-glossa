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
  var html = '<table class="table table-hover table-sm table-borderless">';
  html += '<thead class="table-dark">';
  html += "<tr>";
  html += '<td scope="col">Αναγνωριστικό</td>';
  html += '<td scope="col" style="text-align: center;">Τιμή</td>';
  html += '<td scope="col">Τύπος</th>';
  html += "</tr>";
  html += "</thead>";
  html += "<tbody>";

  for (const rec of data) {
    var idclass = rec.id.replaceAll("[", "-");
    idclass = idclass.replaceAll("]", "");
    idclass = idclass.replaceAll(",", "-");

    html += '<tr class="symbol-' + idclass + '">';
    html += '<td scope="row" class="tdid">' + rec.id + "</td>";
    html += '<td class="tdvalue">';
    if (rec.value != null) {
      html += rec.value;
    }
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

  var sourcecode = aceeditor.getValue();

  var inputdata = $("#" + gloBoxID)
    .find(".gloCodeKeyboardInput")
    .val();

  var slowrun = $("#" + gloBoxID)
    .find(".gloBtnToggleSlowSpeed")
    .hasClass("active");

  var breakpointsArray = aceeditor.session.getBreakpoints();

  var app = getGlossaApp(gloBoxID);
  app.init();

  app.setSourceCode(sourcecode);
  app.setInputBuffer(inputdata);

  app.setDebugMode(true);

  // app.setReadInputFunction(function (name) {
  //   return prompt("Εισαγωγή τιμής στο αναγνωριστικό " + name);
  // });

  app.setReadInputFunction(function () {
    return waitingKeypress(gloBoxID);
  });

  app.setSlowRun(slowrun);
  app.setStepRun(runstep);

  for (var line in breakpointsArray) app.addBreakpoint(Number(line) + 1);

  app.run();
}

async function waitingKeypress(gloBoxID) {
  return new Promise((resolve) => {
    var inputElement = `<input
    class="form-control form-control-sm gloReadFromKeyboard"
    type="text"
    autocomplete="false"
  />`;

    $("#" + gloBoxID)
      .find("ul.gloResult")
      .append('<li class="keyboardInput">' + inputElement + "</li>");

    var textBox = $("#" + gloBoxID).find(".gloResultPre");
    textBox.scrollTop(textBox[0].scrollHeight);

    $("#" + gloBoxID)
      .find("ul.gloResult li.keyboardInput .gloReadFromKeyboard")
      .focus();

    $("#" + gloBoxID + " ul.gloResult li.keyboardInput .gloReadFromKeyboard")
      .off("keyup")
      .on("keyup", function (e) {
        if (e.key == "Enter") {
          $(this).off("keyup");
          var inputVal = $(this).val();
          //console.log('Keyboard value was: #' + inputVal + '#');
          $(".gloReadFromKeyboard").val("");
          resolve(inputVal);
          $(this).parent().remove();
        }
      });
  });
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
    .removeClass("disabled")
    .removeClass("btn-secondary")
    .addClass("btn-danger");

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

  if (
    $("#" + gloBoxID)
      .find(".gloBtnToggleSidebarDisplay")
      .hasClass("active")
  ) {
    $("#" + gloBoxID)
      .find(".gloEntolesTab")
      .hide();

    $("#" + gloBoxID)
      .find(".gloMemTab")
      .show();
  }

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

function UIStateInputRead(gloBoxID, data) {
  $("#" + gloBoxID)
    .find("ul.gloResult")
    .append('<li><span class="readValue">' + data + "</span></li>");

  //    .html(function (index, value) {
  //      return value + '<span class="readValue">' + data + "</span>\n";
  //    });

  var textBox = $("#" + gloBoxID).find(".gloResultPre");
  textBox.scrollTop(textBox[0].scrollHeight);
}

function UIStateContinueRunning(gloBoxID) {
  $("#" + gloBoxID)
    .find(".gloRun i")
    .removeClass("bi-play-fill")
    .addClass("bi-pause-fill");

  $("#" + gloBoxID).removeClass("paused");
}

function UIStatePaused(gloBoxID) {
  $("#" + gloBoxID)
    .find(".gloRun i")
    .removeClass("bi-pause-fill")
    .addClass("bi-play-fill");

  $("#" + gloBoxID).addClass("paused");
}

function UIStateStopped(gloBoxID, msg) {
  $("#" + gloBoxID)
    .find(".gloResult")
    .html(function (index, value) {
      return value + '<span class="noticeMsg">' + msg + "</span>\n";
    });

  // Remove keyboard if exists
  $("#" + gloBoxID + " ul.gloResult li.keyboardInput").remove();

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
    .removeClass("bi-pause-fill")
    .addClass("bi-play-fill");

  $("#" + gloBoxID)
    .find(".gloStop")
    .addClass("disabled")
    .removeClass("btn-danger")
    .addClass("btn-secondary");

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

function UIStateUpdateMemorySymbol(gloBoxID, data1, data2) {
  data1 = data1.replaceAll("[", "-");
  data1 = data1.replaceAll("]", "");
  data1 = data1.replaceAll(",", "-");

  $("#" + gloBoxID)
    .find(".gloMemory")
    .find("tr")
    .removeClass("highlightRow");

  $("#" + gloBoxID)
    .find(".gloMemory")
    .find(".symbol-" + data1)
    .addClass("highlightRow");

  $("#" + gloBoxID)
    .find(".gloMemory")
    .find(".symbol-" + data1)
    .find(".tdvalue")
    .html(data2);
}

function UIStateOutputAppend(gloBoxID, data) {
  $("#" + gloBoxID)
    .find("ul.gloResult")
    .append("<li>" + data + "</li>");
  // .html(function (index, value) {
  //   return value + data + "\n";
  // });

  if (
    $("#" + gloBoxID)
      .find(".gloOutputTab")
      .is(":visible")
  ) {
    var textBox = $("#" + gloBoxID).find(".gloResultPre");
    textBox.scrollTop(textBox[0].scrollHeight);
  }
}

function UIStateOutputDetailsAppend(gloBoxID, data) {
  $("#" + gloBoxID)
    .find(".gloResultDetails")
    .html(function (index, value) {
      return value + data + "\n";
    });

  if (
    $("#" + gloBoxID)
      .find(".gloOutputTabDetails")
      .is(":visible")
  ) {
    var element = $("#" + gloBoxID).find(".gloResultDetailsPre");
    element.scrollTop(element[0].scrollHeight);
  }
}

// ==============================

$(document).ready(function () {
  $(".gloSpinner").hide();

  $(".gloBtnIncFontSize").click(function () {
    var gloBoxElement = $(this).closest(".gloBox");
    var originalFontSize = gloBoxElement.css("font-size");
    var originalFontNumber = parseFloat(originalFontSize, 10);
    var newFontSize = originalFontNumber * 1.2;
    gloBoxElement.css("font-size", newFontSize);
  });

  $(".gloBtnDecrFontSize").click(function () {
    var gloBoxElement = $(this).closest(".gloBox");
    var originalFontSize = gloBoxElement.css("font-size");
    var originalFontNumber = parseFloat(originalFontSize, 10);
    var newFontSize = originalFontNumber * 0.8;
    gloBoxElement.css("font-size", newFontSize);
  });

  $(".gloBtnResetFontSize").click(function () {
    var gloBoxElement = $(this).closest(".gloBox");
    gloBoxElement.css("font-size", "82%");
  });

  $(".gloBtnShowGloInfoModal").click(function (e) {
    $(this).closest(".gloBox").find(".gloInfoModal").modal("show");
  });

  $(".gloEntolesHeader").click(function (e) {
    $(this).closest(".gloBox").find(".gloEntolesTab").show();
    $(this).closest(".gloBox").find(".gloMemTab").hide();
  });

  $(".gloMemHeader").click(function (e) {
    $(this).closest(".gloBox").find(".gloEntolesTab").hide();
    $(this).closest(".gloBox").find(".gloMemTab").show();
  });

  $(".gloCommandText").click(function (e) {
    var editorElement = $(this).closest(".gloBox").find(".gloAceEditor");

    var editorid = editorElement.attr("id");

    var aceeditor = ace.edit(editorid);
    var session = aceeditor.session;
    var cursor = session.selection.cursor;
    var textToInsert = $(this).text();
    session.insert(cursor, textToInsert + " ");

    aceeditor.focus();
  });

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

  $(".gloBtnToggleSidebarDisplay").click(function (e) {
    e.preventDefault();
    if ($(this).hasClass("active")) {
      $(this).removeClass("active");
      $(this).removeClass("btn-primary");
      $(this).addClass("btn-outline-primary");
      $(this).attr("aria-pressed", "false");
      $(this).closest(".gloBox").find(".gloEntolesTab").hide();
      $(this).closest(".gloBox").find(".gloMemTab").hide();
    } else {
      $(this).addClass("active");
      $(this).removeClass("btn-outline-primary");
      $(this).addClass("btn-primary");
      $(this).attr("aria-pressed", "true");
      $(this).closest(".gloBox").find(".gloEntolesTab").show();
      $(this).closest(".gloBox").find(".gloMemTab").hide();
    }
  });

  $(".gloBtnToggleSlowSpeed").click(function (e) {
    e.preventDefault();
    if ($(this).hasClass("active")) {
      $(this).removeClass("active");
      $(this).removeClass("btn-primary");
      $(this).addClass("btn-outline-primary");
      $(this).attr("aria-pressed", "false");
    } else {
      $(this).addClass("active");
      $(this).removeClass("btn-outline-primary");
      $(this).addClass("btn-primary");
      $(this).attr("aria-pressed", "true");
    }
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
    .find(".gloBtnToggleSlowSpeed")
    .click(function (e) {
      var gloBoxID = $(this).closest(".gloBox").attr("id");

      var app = getGlossaApp(gloBoxID);

      if (!app.isrunning()) return;

      var slowrun = $(this).hasClass("active");

      if (slowrun) {
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

    ace.require("ace/ext/language_tools");
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

    editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: false,
      enableLiveAutocompletion: false,
      fontFamily: "Fira Mono, monospace",
      fontSize: "100%",
    });

    editor.commands.on("afterExec", function (e) {
      if (e.command.name == "insertstring" && /^[\<_]$/.test(e.args)) {
        editor.execCommand("startAutocomplete");
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
    app.on("memorysymbolupdate", (data1, data2) => {
      UIStateUpdateMemorySymbol(gloBoxID, data1, data2);
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

    /*
    editor.commands.on("afterExec", function (e) {
      if (
        e.command.name == "insertstring" &&
        (/^[\< ]$/.test(e.args) ||
          /^[\<\n]$/.test(e.args) ||
          /^[\<:]$/.test(e.args))
      ) {
         var editor = e.editor;
      var session = editor.session;
    var  cursor = session.selection.cursor;
     var line =  session.getLine(cursor.row).slice(0,  cursor.column);
     var lineWords = line.trim().split(' ');
     const lastWord = lineWords[lineWords.length - 1];
     
        //console.log('Last word: ' + lastWord);
//const range = editor.selection.getRange();

// Xalia kwdikas! Fix opoios mporei!

replaceIfFound(editor, 'programma', 'ΠΡΟΓΡΑΜΜΑ');

replaceIfFound(editor, 'metablhtes', 'ΜΕΤΑΒΛΗΤΕΣ');
replaceIfFound(editor, 'staueres', 'ΣΤΑΘΕΡΕΣ');

replaceIfFound(editor, 'akeraies', 'ΑΚΕΡΑΙΕΣ');
replaceIfFound(editor, 'pragmatikes', 'ΠΡΑΓΜΑΤΙΚΕΣ');
replaceIfFound(editor, 'xarakthres', 'ΧΑΡΑΚΤΗΡΕΣ');
replaceIfFound(editor, 'logikes', 'ΛΟΓΙΚΕΣ');

replaceIfFound(editor, 'arxh', 'ΑΡΧΗ');
replaceIfFound(editor, 'telos_programmatos', 'ΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ');

replaceIfFound(editor, 'an', 'ΑΝ');
replaceIfFound(editor, 'tote', 'ΤΟΤΕ');
replaceIfFound(editor, 'allivs', 'ΑΛΛΙΩΣ');
replaceIfFound(editor, 'allivs_an', 'ΑΛΛΙΩΣ_ΑΝ');
replaceIfFound(editor, 'telos_an', 'ΤΕΛΟΣ_ΑΝ');
replaceIfFound(editor, 'grace', 'ΓΡΑΨΕ');
replaceIfFound(editor, 'diabase', 'ΔΙΑΒΑΣΕ');
replaceIfFound(editor, 'oso', 'ΟΣΟ');
replaceIfFound(editor, 'epanalabe', 'ΕΠΑΝΑΛΑΒΕ');
replaceIfFound(editor, 'telos_epanalhchs', 'ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ');
replaceIfFound(editor, 'arxh_epanalhchs', 'ΑΡΧΗ_ΕΠΑΝΑΛΗΨΗΣ');
replaceIfFound(editor, 'mexris_otou', 'ΜΕΧΡΙΣ_ΟΤΟΥ');
replaceIfFound(editor, 'gia', 'ΓΙΑ');
replaceIfFound(editor, 'apo', 'ΑΠΟ');
replaceIfFound(editor, 'mexri', 'ΜΕΧΡΙ');
replaceIfFound(editor, 'me_bhma', 'ΜΕ_ΒΗΜΑ');

replaceIfFound(editor, 'διβ', 'DIV');
replaceIfFound(editor, 'μοδ', 'MOD');

replaceIfFound(editor, 'oxi', 'ΟΧΙ');
replaceIfFound(editor, 'kai', 'ΚΑΙ');
replaceIfFound(editor, 'h', 'Η');
*/
    /*
editor.find('[ \t]+$',{
  backwards: false,
  wrap: true,
  caseSensitive: false,
  wholeWord: false,
  regExp: true
});
editor.replaceAll('');
      }
    });

    function replaceIfFound(editor, key, ckey) {
      var range = editor.find(key, {
        wrap: true,
        caseSensitive: false,
        wholeWord: true,
        regExp: false,
        preventScroll: true,
      });
      if (range != null) editor.session.replace(range, ckey);
    }
*/

    var cookieData = Cookies.get("editorSourceCode");

    const mycode = ``;

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

      if (typeof breakpoints[row] === typeof undefined) {
        e.editor.session.setBreakpoint(row);
        app.addBreakpoint(Number(row) + 1);
      } else {
        e.editor.session.clearBreakpoint(row);
        app.removeBreakpoint(Number(row) + 1);
      }

      e.stop();
    });

    editor.on("change", function (e) {
      var breakpointsArray = editor.session.getBreakpoints();

      if (editor.session.getBreakpoints().length > 0) {
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
  });
});
