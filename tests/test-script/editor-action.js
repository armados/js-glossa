$(document).ready(function () {
  $("#spinner").hide();

  var codeEditorElement = document.getElementById("codeeditor");

  var editor1 = CodeMirror.fromTextArea(codeEditorElement, {
    mode: "application/x-httpd-php",
    lineNumbers: true,
    matchBrackets: true,
    theme: "default",
    lineWiseCopyCut: true,
    undoDepth: 200,
  });
  editor1.setValue(
    "ΠΡΟΓΡΑΜΜΑ Άσκηση\n\n\nΑΡΧΗ\n\n  ΓΡΑΨΕ 'Καλημέρα κόσμε'\n\nΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ\n"
  );

  var codeEditorElement2 = document.getElementById("codekeyboardinput");

  var editor2 = CodeMirror.fromTextArea(codeEditorElement2, {
    lineNumbers: false,
    matchBrackets: false,
    theme: "default",
    lineWiseCopyCut: true,
    undoDepth: 200,
  });

  $("#run").click(function (e) {
    e.preventDefault();

    $("#error").html("").hide();

    $("#result").html("");

    $("#run").addClass("disabled");
    $("#run").prop("disabled", true);

    $("#spinner").show();

    var editorCode = editor1.getValue();

    $("#spinner").hide();

    $("#run").removeClass("disabled");
    $("#run").prop("disabled", false);

    var output = null;
    try {

      var pr1 = new GLO.GlossaJS();
      pr1.setSourceCode(editorCode);
      if ( editor2.getValue() != '') pr1.setInputBuffer(editor2.getValue());
      output = pr1.run();

    } catch (e) {
      output = e.message;
    }

    $("#result").html(output);
  });
});
