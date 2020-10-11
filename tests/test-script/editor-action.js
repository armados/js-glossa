$(document).ready(function () {
 
  $(".btnShowInput").click(function (e) {
    e.preventDefault();
    $('#outputTab').hide();
    $('#inputTab').show();
  });

  $(".btnShowOutput").click(function (e) {
    e.preventDefault();
    $('#inputTab').hide();
    $('#outputTab').show();
  });


  $("#spinner").hide();
  


  var codeEditorElement = document.getElementById("codeeditor");

  var editor1 = CodeMirror.fromTextArea(codeEditorElement, {
    mode: "application/x-httpd-php",
    lineNumbers: true,
    matchBrackets: true,
    theme: "mbo",
    lineWiseCopyCut: true,
    undoDepth: 200,
  });
  editor1.setValue(
    "ΠΡΟΓΡΑΜΜΑ Άσκηση\n\nΜΕΤΑΒΛΗΤΕΣ\nΑΚΕΡΑΙΕΣ: α\n\nΑΡΧΗ\n\nΓΙΑ α ΑΠΟ 1 ΜΕΧΡΙ 10\n  ΓΡΑΨΕ 'Καλημέρα κόσμε', α\nΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ\n\nΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ\n"
  );


  $("#run").click(function (e) {
    e.preventDefault();

    $("#spinner").show();

    $("#run").addClass("disabled");
    $("#run").prop("disabled", true);


    $(".btnShowOutput").click();

    $("#result").html("Περιμένετε....");    

    $("#error").html("").hide();

    var editorCode = editor1.getValue();

    var output = null;
    try {

      var pr1 = new GLO.GlossaJS();
      pr1.setSourceCode(editorCode);
      if ( $("#codekeyboardinput").val() != '') pr1.setInputBuffer($("#codekeyboardinput").val());
      output = pr1.run();

    } catch (e) {
      output = e.message;
    }

    $("#spinner").hide();

    $("#result").html(output);
  
    $("#run").removeClass("disabled");
    $("#run").prop("disabled", false);


    $('#resultpre').animate({
      scrollTop: $('#resultpre').get(0).scrollHeight
    }, 400);
    });
});
