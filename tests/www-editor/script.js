var gloWorker = null;

if (!window.Worker) alert("Web Worker not supported by this browser");


// ==============================


function initGloWorker() {
  var worker = new Worker("worker.js");

  worker.addEventListener(
    "message",
    function (event) {
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

      var method = event.data[0] || null;
      var editorid = event.data[1] || null;
      var data = event.data[2] || null;

      var aceeditor = ace.edit(editorid);

      switch (method) {
        case "prompt":
          //console.log("Got Memory data");
          //console.log(objectToString(e.data["data"]));
          var data = prompt("Εισαγωγή από το πληκτρολόγιο:");
          break;

        case "memory":
          //console.log("Got Memory data");
          //console.log(objectToString(e.data["data"]));
          $("#memory").html(objectToString(data));
          break;
        case "line":
          //console.log("Update line " + data);
          aceeditor.setHighlightActiveLine(true);
          aceeditor.gotoLine(data);
          break;
        case "outputappend":
          //console.log("Update outputappend");
          var output = data;
          $("#" + editorid)
            .closest(".gloBox")
            .find(".gloResult")
            .html(function (index, value) {
              return value + output + "\n";
            });

          break;
        case "outputdetailtsappend":
          //console.log("Update outputdetailtsappend");
          var output = data;
          $("#" + editorid)
            .closest(".gloBox")
            .find(".gloResultDetails")
            .html(function (index, value) {
              return value + output + "\n";
            });

          break;
        case "finishedwitherror":
          //console.log("Update error");
          var output = data;
          $("#" + editorid)
            .closest(".gloBox")
            .find(".gloResult")
            .html(function (index, value) {
              return value + "ERROR!!" + output + "\n";
            });

          break;

        case "finished":
          //console.log("Update finished");

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
      }

      /*
    $("#"+editorid)
      .closest(".gloBox")
      .find(".gloResultPre")
      .animate(
        {
          scrollTop: $("#"+editorid).closest(".gloBox").find(".gloResultPre").get(0)
            .scrollHeight,
        },
        400
      );
      */
    },
    false
  );

  return worker;
}

$(document).ready(function () {
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
    gloWorker.postMessage(['ping', null, 'Hey!!!! i am here!!']);
  });

  $(".gloSpinner").hide();

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

    var aceeditor = ace.edit(AceEditorID);

    aceeditor.setReadOnly(true);

    var sourcecode = aceeditor.getValue();

    var inputbox = $(this)
      .closest(".gloBox")
      .find(".gloCodeKeyboardInput")
      .val();

    var slowrun = $(this).closest(".gloBox").find(".gloSlowRun").is(":checked");

    var arrData = [
      sourcecode,
      inputbox,
      slowrun,
    ];

    var arrCall = [
      'run',
      AceEditorID,
      arrData
    ];


    gloWorker = initGloWorker();
    gloWorker.postMessage(arrCall);
  });

  $(".gloStop").click(function (e) {
    e.preventDefault();

    gloWorker.terminate(); // FIXME:

    $(this).closest(".gloBox").find(".gloSpinner").hide();

    $(this).closest(".gloBox").find(".gloStop").addClass("disabled");
    $(this).closest(".gloBox").find(".gloStop").prop("disabled", true);

    $(this).closest(".gloBox").find(".gloRun").removeClass("disabled");
    $(this).closest(".gloBox").find(".gloRun").prop("disabled", false);

    $("#memory").html("");

    var AceEditorID = $(this).closest(".gloBox").find(".gloAceEditor").get(0)
      .id;

    var aceeditor = ace.edit(AceEditorID);

    aceeditor.setHighlightActiveLine(false);
    aceeditor.setReadOnly(false);
  });
});
