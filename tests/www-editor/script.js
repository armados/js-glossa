$(document).ready(function () {
  $("h4").click(function (e) {
    e.preventDefault();
    editor.setTheme("ace/theme/gruvbox");
  });

  $(".gloBtnShowInput").click(function (e) {
    e.preventDefault();
    $(".gloOutputTab").hide();
    $(".gloOutputTabDetails").hide();
    $(".gloInputTab").show();
  });

  $(".gloBtnShowOutput").click(function (e) {
    e.preventDefault();
    $(".gloInputTab").hide();
    $(".gloOutputTab").show();
    $(".gloOutputTabDetails").hide();
  });

  $(".gloBtnShowOutputDetails").click(function (e) {
    e.preventDefault();
    $(".gloInputTab").hide();
    $(".gloOutputTab").hide();
    $(".gloOutputTabDetails").show();
  });

  $(".gloSpinner").hide();

  editor.setValue(
    "ΠΡΟΓΡΑΜΜΑ Άσκηση\n\nΜΕΤΑΒΛΗΤΕΣ\nΑΚΕΡΑΙΕΣ: α\n\nΑΡΧΗ\n\nΓΙΑ α ΑΠΟ 1 ΜΕΧΡΙ 10\n  ΓΡΑΨΕ 'Καλημέρα κόσμε', α\nΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ\n\nΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ\n"
  );
  editor.clearSelection();
  //  editor.gotoLine(3);
  //  editor.setReadOnly(true);

  $(".gloRun").click(function (e) {
    e.preventDefault();

    $(".gloSpinner").show();

    editor.setReadOnly(true);

    $(".gloRun").addClass("disabled");
    $(".gloRun").prop("disabled", true);

    $(".gloBtnShowOutput").click();

    $(".gloResult").html("Περιμένετε....");
    $(".gloResultDetails").html("Περιμένετε....");

    $(".gloError").html("").hide();

    var editorCode = editor.getValue();

    var output1 = null;
    var output2 = null;
    try {
      var app = new GLO.GlossaJS();
      app.setSourceCode(editorCode);

      if ($(".gloCodeKeyboardInput").val() != "")
        app.setInputBuffer($(".gloCodeKeyboardInput").val());
      app.run();
      output1 = app.getOutput();
      output2 = app.getOutputDetails();
    } catch (e) {
      output1 = e.message;
      output2 = e.message;
    }

    $(".gloSpinner").hide();

    $(".gloResult").html(output1);
    $(".gloResultDetails").html(output2);

    $(".gloRun").removeClass("disabled");
    $(".gloRun").prop("disabled", false);

    editor.setReadOnly(false);

    $(".gloResultPre").animate(
      {
        scrollTop: $(".gloResultPre").get(0).scrollHeight,
      },
      400
    );
  });
});
