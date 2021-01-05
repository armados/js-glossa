var editorid = null;
var aceeditor = null;
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

function updateUI(method, data = null) {
  switch (method) {
    case "prompt":
      return prompt("Εισαγωγή τιμής στο αναγνωριστικό " + data);
      break;

    case "memory":
      $("#memory").html(objectToString(data));
      break;
    case "line":
      aceeditor.setHighlightActiveLine(true);
      aceeditor.gotoLine(data);
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
          return value + "ERROR!!" + data + "\n";
        });

      break;

    case "stopped":
    case "finished":
      console.log("Execution finished");

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

      aceeditor.setHighlightActiveLine(false);
      aceeditor.setReadOnly(false);

      break;

    default:
      throw new Error("Invalid method: " + method);
  }
}

async function runWorker(sourcecode, inputdata, slowrun) {
  app = new GLO.GlossaJS();

  app.setSourceCode(sourcecode);
  app.setInputBuffer(inputdata);
  app.setSlowRun(slowrun);
  await app.run();

  updateUI("finished");
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

  $(".gloRun").click(function (e) {
    e.preventDefault();

    $(this).closest(".gloBox").find(".gloSpinner").show();

    $(this).closest(".gloBox").find(".gloRun").addClass("disabled");
    $(this).closest(".gloBox").find(".gloRun").prop("disabled", true);

    $(this).closest(".gloBox").find(".gloStop").removeClass("disabled");
    $(this).closest(".gloBox").find(".gloStop").prop("disabled", false);

    $(this).closest(".gloBox").find(".gloBtnShowOutput").click();

    $(this).closest(".gloBox").find(".gloResult").html("");
    $(this).closest(".gloBox").find(".gloResultDetails").html("");
    $("#memory").html("");

    $(this).closest(".gloBox").find(".gloError").html("").hide();

    var AceEditorID = $(this).closest(".gloBox").find(".gloAceEditor").get(0)
      .id;

    editorid = AceEditorID;

    aceeditor = ace.edit(AceEditorID);

    aceeditor.setReadOnly(true);

    var sourcecode = aceeditor.getValue();

    var inputbox = $(this)
      .closest(".gloBox")
      .find(".gloCodeKeyboardInput")
      .val();

    var slowrun = $(this).closest(".gloBox").find(".gloSlowRun").is(":checked");

    runWorker(sourcecode, inputbox, slowrun);
  });

  $(".gloStop").click(function (e) {
    e.preventDefault();

    app.terminate();

    updateUI("stopped");
  });
});
