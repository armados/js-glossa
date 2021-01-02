importScripts("../../dist/glossajs.min.js");

var editorid = null;

function updateUI(cmd, data = null) {
  switch (cmd) {
    case "line":
      self.postMessage({ cmd: "line", editorid: editorid, data: data });
      break;
    case "outputappend":
      self.postMessage({ cmd: "outputappend", editorid: editorid, data: data });
      break;
    case "outputdetailtsappend":
      self.postMessage({
        cmd: "outputdetailtsappend",
        editorid: editorid,
        data: data,
      });
      break;
    case "error":
      self.postMessage({ cmd: "error", editorid: editorid, data: data });
      break;
    case "finished":
      self.postMessage({ cmd: "finished", editorid: editorid, data: null });
      break;
    default:
      throw new Error("Invalid command");
  }
}

function runWorker(sourcecode, keyboardbuffer, runspeed) {
  var app = new GLO.GlossaJS();

  app.setSourceCode(sourcecode);

  if (keyboardbuffer != "") app.setInputBuffer(keyboardbuffer);

  app.setRunSpeed(runspeed);
  
  var errorMsg = null;

  try {
    app.run();
  } catch (e) {
    errorMsg = e.message;
  }

  if (errorMsg == null) updateUI("finished");
  else updateUI("finishedwitherror");
}

self.addEventListener(
  "message",
  function (e) {
    editorid = e.data["editorid"];
    var sourcecode = e.data["sourcecode"];
    var keyboardbuffer = e.data["keyboardbuffer"];
    var runspeed = e.data["runspeed"];

    runWorker(sourcecode, keyboardbuffer, runspeed);
  },
  false
);
