$(document).ready(function () {
  $("#spinner").hide();

  var codeEditorElement = document.getElementById("code-editor");

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

  var codeEditorElement2 = document.getElementById("code-keyboardinput");

  var editor2 = CodeMirror.fromTextArea(codeEditorElement2, {
    lineNumbers: true,
    matchBrackets: true,
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

    var progoutput = null;
    try {
      console.log('getvalue: ', editor2.getValue());
      progoutput = GlossaJS.parseGlossaJS(editorCode, editor2.getValue());
    } catch (e) {
      progoutput = e.message;
    }

    $("#result").html(progoutput);
  });
});