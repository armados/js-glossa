var worker = new Worker("worker.js");

worker.addEventListener(
  "message",
  function (e) {
    var editorid = e.data["editorid"];

    var aceeditor = ace.edit(editorid);

    function objectToString(obj) {
      var variables = [];

      for (var key in obj) {

        if (obj[key]["obj"] != null)
          variables.push(key + " = " + obj[key]["obj"]["val"]);
        else variables.push((key + " = <i>null</i>"));
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

    switch (e.data["cmd"]) {
      case "memory":
        //console.log("Got Memory data");
        //console.log(objectToString(e.data["data"]));
        $("#memory").html(objectToString(e.data["data"]));
        break;
      case "line":
        console.log("Update line " + e.data["data"]);
        aceeditor.gotoLine(e.data["data"]);
        break;
      case "outputappend":
        //console.log("Update outputappend");
        var output = e.data["data"];
        $("#" + editorid)
          .closest(".gloBox")
          .find(".gloResult")
          .html(function (index, value) {
            return value + output + "\n";
          });

        break;
      case "outputdetailtsappend":
        //console.log("Update outputdetailtsappend");
        var output = e.data["data"];
        $("#" + editorid)
          .closest(".gloBox")
          .find(".gloResultDetails")
          .html(function (index, value) {
            return value + output + "\n";
          });

        break;
      case "finishedwitherror":
        //console.log("Update error");
        var output = e.data["data"];
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

    $(this).closest(".gloBox").find(".gloError").html("").hide();

    var AceEditorID = $(this).closest(".gloBox").find(".gloAceEditor").get(0)
      .id;

    var aceeditor = ace.edit(AceEditorID);

    aceeditor.setReadOnly(true);
    aceeditor.setHighlightActiveLine(true);

    var sourcecode = aceeditor.getValue();

    var inputbox = $(this)
      .closest(".gloBox")
      .find(".gloCodeKeyboardInput")
      .val();

    var slowrun = $(this).closest(".gloBox").find(".gloSlowRun").is(":checked");

    var arr = {
      editorid: AceEditorID,
      sourcecode: sourcecode,
      keyboardbuffer: inputbox,
      slowrun: slowrun,
    };

    worker.postMessage(arr);
  });

  $(".gloStop").click(function (e) {
    e.preventDefault();

    worker.postMessage("abort"); // FIXME:

    $(this).closest(".gloBox").find(".gloSpinner").hide();

    $(this).closest(".gloBox").find(".gloStop").addClass("disabled");
    $(this).closest(".gloBox").find(".gloStop").prop("disabled", true);

    $(this).closest(".gloBox").find(".gloRun").removeClass("disabled");
    $(this).closest(".gloBox").find(".gloRun").prop("disabled", false);
  });
});
