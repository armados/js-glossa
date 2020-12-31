var worker = new Worker("worker.js");

worker.addEventListener(
  "message",
  function (e) {
    var editorid = e.data["editorid"];

    var aceeditor = ace.edit(editorid);

    //console.log("UI: Rec msg");

    switch (e.data["cmd"]) {
      case "line":
        console.log("Update line " + e.data["data"]);
        aceeditor.setHighlightActiveLine(true);
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
      case "error":
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
          .find(".gloRun")
          .removeClass("disabled");
        $("#" + editorid)
          .closest(".gloBox")
          .find(".gloRun")
          .prop("disabled", false);

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

    $(this).closest(".gloBox").find(".gloBtnShowOutput").click();

    $(this).closest(".gloBox").find(".gloResult").html("");
    $(this).closest(".gloBox").find(".gloResultDetails").html("");

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

    //if ($(this).closest(".gloBox").find(".gloCodeKeyboardInput").val() != "")
    //  app.setInputBuffer($(this).closest(".gloBox").find(".gloCodeKeyboardInput").val());

    var arr = {
      editorid: AceEditorID,
      sourcecode: sourcecode,
      keyboardbuffer: inputbox,
      runspeed: "FIXME",
    };

    worker.postMessage(arr);
  });
});
