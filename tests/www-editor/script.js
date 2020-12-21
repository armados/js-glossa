$(document).ready(function () {
  $("h4").click(function (e) {
    e.preventDefault();
    editor.setTheme("ace/theme/gruvbox");
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

  $(".gloSpinner").hide();

  $(".gloRun").click(function (e) {
    e.preventDefault();

    $(this).closest(".gloBox").find(".gloSpinner").show();

    //editor.setReadOnly(true);

    $(this).closest(".gloBox").find(".gloRun").addClass("disabled");
    $(this).closest(".gloBox").find(".gloRun").prop("disabled", true);

    $(this).closest(".gloBox").find(".gloBtnShowOutput").click();

    $(this).closest(".gloBox").find(".gloResult").html("Περιμένετε....");
    $(this).closest(".gloBox").find(".gloResultDetails").html("Περιμένετε....");

    $(this).closest(".gloBox").find(".gloError").html("").hide();

    var AceEditorID = $(this).closest(".gloBox").find(".gloAceEditor").get(0).id;

    var aceeditor = ace.edit(AceEditorID);
    
    var editorCode = aceeditor.getValue();

    var output1 = null;
    var output2 = null;
    try {
      var app = new GLO.GlossaJS();
      app.setSourceCode(editorCode);

      if ($(this).closest(".gloBox").find(".gloCodeKeyboardInput").val() != "")
        app.setInputBuffer($(this).closest(".gloBox").find(".gloCodeKeyboardInput").val());
      app.run();
      output1 = app.getOutput();
      output2 = app.getOutputDetails();
    } catch (e) {
      output1 = e.message;
      output2 = e.message;
    }

    $(this).closest(".gloBox").find(".gloSpinner").hide();

    $(this).closest(".gloBox").find(".gloResult").html(output1);
    $(this).closest(".gloBox").find(".gloResultDetails").html(output2);

    $(this).closest(".gloBox").find(".gloRun").removeClass("disabled");
    $(this).closest(".gloBox").find(".gloRun").prop("disabled", false);

    //editor.setReadOnly(false);

    $(this).closest(".gloBox").find(".gloResultPre").animate(
      {
        scrollTop: $(this).closest(".gloBox").find(".gloResultPre").get(0).scrollHeight,
      },
      400
    );
  });
});
