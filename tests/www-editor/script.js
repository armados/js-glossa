var editorid = null;
//var aceeditor = null;
var app = null;

function objectToString(obj) {
  var variables = [];

  for (var key in obj) {
    if (obj[key]["obj"] != null)
      variables.push(key + " = " + obj[key]["obj"]["val"]);
    else variables.push(key + " =");
  }

  var html =
    "<ul>" +
    variables
      .map(function (variable) {
        return "<li>" + variable + "</li>";
      })
      .join("") +
    "</ul>";

  return html;
}

function UIStateStarted(editorid) {
  aceeditor = ace.edit(editorid);
  aceeditor.setHighlightActiveLine(true);
  aceeditor.setReadOnly(true);

  $("#" + editorid)
    .closest(".gloBox")
    .find(".gloSpinner")
    .show();

  $("#" + editorid)
    .closest(".gloBox")
    .find(".gloRun")
    .addClass("disabled");
  $("#" + editorid)
    .closest(".gloBox")
    .find(".gloRun")
    .prop("disabled", true);

  $("#" + editorid)
    .closest(".gloBox")
    .find(".gloStop")
    .removeClass("disabled");

  $("#" + editorid)
    .closest(".gloBox")
    .find(".gloStop")
    .prop("disabled", false);

  $("#" + editorid)
    .closest(".gloBox")
    .find(".gloBtnShowOutput")
    .click();

  $("#" + editorid)
    .closest(".gloBox")
    .find(".gloResult")
    .html("");
  $("#" + editorid)
    .closest(".gloBox")
    .find(".gloResultDetails")
    .html("");
  $("#memory").html("");

  $("#" + editorid)
    .closest(".gloBox")
    .find(".gloError")
    .html("")
    .hide();
}

function UIStateStopped(editorid) {
  UIStateFinished(editorid);
}

function UIStateFinished(editorid) {
  aceeditor = ace.edit(editorid);
  aceeditor.setHighlightActiveLine(false);
  aceeditor.setReadOnly(false);

  $("#" + editorid)
    .closest(".gloBox")
    .find(".gloSpinner")
    .hide();

  $("#" + editorid)
    .closest(".gloBox")
    .find(".gloStop")
    .addClass("disabled");

  $("#" + editorid)
    .closest(".gloBox")
    .find(".gloStop")
    .prop("disabled", true);

  $("#" + editorid)
    .closest(".gloBox")
    .find(".gloRun")
    .removeClass("disabled");

  $("#" + editorid)
    .closest(".gloBox")
    .find(".gloRun")
    .prop("disabled", false);
}

function UIStatePaused(editorid) {}

function UIStateUpdateCodeLine(editorid, data) {
  aceeditor = ace.edit(editorid);
  aceeditor.gotoLine(data);
}

function UIStateUpdateMemory(editorid, data) {
  $("#memory").html(objectToString(data));
}

function UIStatePromptUser(editorid, data) {
  return prompt("Εισαγωγή τιμής στο αναγνωριστικό " + data);
}

// ===============================================

function updateUI(method, data = null) {
  console.log(
    "[updateUI func] Method: " + " " + method + " | EditorID: " + editorid
  );
  switch (method) {
    case "prompt":
      return UIStatePromptUser(editorid, data);
      break;
    case "memory":
      UIStateUpdateMemory(editorid, data);
      break;
    case "line":
      UIStateUpdateCodeLine(editorid, data);
      break;
    case "outputappend":
      $("#" + editorid)
        .closest(".gloBox")
        .find(".gloResult")
        .html(function (index, value) {
          return value + data + "\n";
        });

      $("#" + editorid)
        .closest(".gloBox")
        .find(".gloResultPre")
        .animate(
          {
            scrollTop: $("#" + editorid)
              .closest(".gloBox")
              .find(".gloResultPre")
              .get(0).scrollHeight,
          },
          0
        );

      break;
    case "outputdetailtsappend":
      $("#" + editorid)
        .closest(".gloBox")
        .find(".gloResultDetails")
        .html(function (index, value) {
          return value + data + "\n";
        });
      break;
    case "error":
      $("#" + editorid)
        .closest(".gloBox")
        .find(".gloResult")
        .html(function (index, value) {
          return value + data + "\n";
        });

      break;

    case "started":
      UIStateStarted(editorid);
      break;
    case "stopped":
      UIStateStopped(editorid);
      break;
    case "finished":
      UIStateFinished(editorid);
      break;

    default:
      throw new Error("[updateUI func] Invalid method: " + method);
  }
}

async function startProgramExecution(editorid, runstep) {
  aceeditor = ace.edit(editorid);

  var sourcecode = aceeditor.getValue();

  var inputdata = $("#" + editorid)
    .closest(".gloBox")
    .find(".gloCodeKeyboardInput")
    .val();

  var slowrun = $("#" + editorid)
    .closest(".gloBox")
    .find(".gloSlowRun")
    .is(":checked");

  app = new GLO.GlossaJS();
  app.setSourceCode(sourcecode);
  app.setInputBuffer(inputdata);
  app.setSlowRun(slowrun);
  app.setStepRun(runstep);
  app.run();
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

  $(".gloRunStep").click(function (e) {
    e.preventDefault();

    editorid = $(this).closest(".gloBox").find(".gloAceEditor").get(0).id;

    app.runNext();
  });

  $(".gloRun").click(function (e) {
    e.preventDefault();

    editorid = $(this).closest(".gloBox").find(".gloAceEditor").get(0).id;

    startProgramExecution(editorid, false);
  });

  $(".gloStop").click(function (e) {
    e.preventDefault();

    app.runNext();
    app.terminate();
  });


  $(".gloAceEditor").each(function (index) {
    var editor = ace.edit(this);

    var randomID = Math.floor((Math.random() * 100000) + 1);
    $(this).closest(".gloBox").attr("id",'gloBoxID'+randomID);

    var   app01 = new GLO.GlossaJS();
    $(this).closest(".gloBox").bind(app01);

    require("ace/config").setModuleUrl(
      "ace/theme/gruvbox",
      "https://ajaxorg.github.io/ace-builds/src/theme-gruvbox.js"
    );
    
    editor.setTheme("ace/theme/gruvbox");
    require("ace/config").setModuleUrl("ace/mode/glossa", "acemodeglo.js");

    editor.session.setMode("ace/mode/glossa");
    editor.setDisplayIndentGuides(false);
    editor.setShowPrintMargin(false);
    editor.setHighlightActiveLine(false);
    editor.renderer.setShowGutter(true);
    editor.clearSelection();

    var cookieData = Cookies.get("editorSourceCode");

    //console.log('#'+cookieData+'#');

    if (typeof cookieData !== "undefined" && cookieData != "")
      editor.setValue(cookieData);
    else
      editor.setValue(
        "ΠΡΟΓΡΑΜΜΑ Άσκηση\n\nΜΕΤΑΒΛΗΤΕΣ\nΑΚΕΡΑΙΕΣ: α\n\nΑΡΧΗ\n\nΓΙΑ α ΑΠΟ 1 ΜΕΧΡΙ 10\n  ΓΡΑΨΕ 'Καλημέρα κόσμε', α\nΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ\n\nΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ\n"
      );

    //Cookies.set("editorSourceCode", editor.getValue(), { expires: 7 });

    editor.clearSelection();

    editor.getSession().on("change", function () {
      //console.log("editor was changed by user typing or copy paste");
      Cookies.set("editorSourceCode", editor.getValue());
    });
    //  editor.gotoLine(3);
    //  editor.setReadOnly(true);

    //editor.focus();
  });


});
