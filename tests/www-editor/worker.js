importScripts("../../dist/glossajs.min.js");

var editorid = null;


function runWorker(sourcecode, keyboardbuffer, slowrun) {
  var app = new GLO.GlossaJS();

  app.setSourceCode(sourcecode);
  app.setInputBuffer(keyboardbuffer);
  app.setSlowRun(slowrun);

  var errorMsg = null;

  try {
    app.run();
  } catch (e) {
    errorMsg = e.message;
  }

  if (errorMsg == null) updateUI("finished");
  else updateUI("finishedwitherror");
}


function updateUI(method, data = null) {
  switch (method) {
    case "prompt":
      //console.log(data);
      self.postMessage(["prompt"]);
      break;

    case "memory":
      //console.log(data);
      self.postMessage(["memory", editorid, data]);
      break;
    case "line":
      self.postMessage(["line", editorid, data]);
      break;
    case "outputappend":
      self.postMessage(["outputappend", editorid, data]);
      break;
    case "outputdetailtsappend":
      self.postMessage(["outputdetailtsappend", editorid, data]);
      break;
    case "error":
      self.postMessage(["error", editorid, data]);
      break;
    case "finished":
      self.postMessage(["finished", editorid, null]);
      break;
    default:
      throw new Error("Worker: Invalid command");
  }
}






self.addEventListener(
  "message",
  function (event) {
    editorid = event.data["editorid"];
    var sourcecode = event.data["sourcecode"];
    var keyboardbuffer = event.data["keyboardbuffer"];
    var slowrun = event.data["slowrun"];

    runWorker(sourcecode, keyboardbuffer, slowrun);
  },
  false
);
