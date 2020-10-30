$(document).ready(function () {

  $("h4").click(function (e) {
    e.preventDefault();
    editor.setTheme("ace/theme/gruvbox");
  });

  $(".btnShowInput").click(function (e) {
    e.preventDefault();
    $("#outputTab").hide();
    $("#outputTabDetails").hide();
    $("#inputTab").show();
  });

  $(".btnShowOutput").click(function (e) {
    e.preventDefault();
    $("#inputTab").hide();
    $("#outputTab").show();
    $("#outputTabDetails").hide();
  });

  $(".btnShowOutputDetails").click(function (e) {
    e.preventDefault();
    $("#inputTab").hide();
    $("#outputTab").hide();
    $("#outputTabDetails").show();
  });

  $("#spinner").hide();

 
  editor.setValue(
    "ΠΡΟΓΡΑΜΜΑ Άσκηση\n\nΜΕΤΑΒΛΗΤΕΣ\nΑΚΕΡΑΙΕΣ: α\n\nΑΡΧΗ\n\nΓΙΑ α ΑΠΟ 1 ΜΕΧΡΙ 10\n  ΓΡΑΨΕ 'Καλημέρα κόσμε', α\nΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ\n\nΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ\n"
  );
  editor.clearSelection();
//  editor.gotoLine(3);
//  editor.setReadOnly(true);


  $("#run").click(function (e) {
    e.preventDefault();

    editor.setReadOnly(true);

    $("#spinner").show();

    $("#run").addClass("disabled");
    $("#run").prop("disabled", true);

    $(".btnShowOutput").click();

    $("#result").html("Περιμένετε....");
    $("#resultDetails").html("Περιμένετε....");

    $("#error").html("").hide();

    var editorCode = editor.getValue();

    var output1 = null;
    var output2 = null;
    try {
      var app = new GLO.GlossaJS();
      app.setSourceCode(editorCode);
      
      if ($("#codekeyboardinput").val() != "")
        app.setInputBuffer($("#codekeyboardinput").val());
        app.run();
        output1 = app.getOutput();
        output2 = app.getOutputDetails();
      } catch (e) {
      output1 = e.message;
      output2 = e.message;
    }

    $("#spinner").hide();

    $("#result").html(output1);
    $("#resultDetails").html(output2);

    $("#run").removeClass("disabled");
    $("#run").prop("disabled", false);

    editor.setReadOnly(false);

    $("#resultpre").animate(
      {
        scrollTop: $("#resultpre").get(0).scrollHeight,
      },
      400
    );
  });
});
