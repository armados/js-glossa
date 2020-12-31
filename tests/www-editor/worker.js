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

function runWorker(sourcecode) {
  var app = new GLO.GlossaJS();

  app.setSourceCode(sourcecode);

  var errorMsg = null;
  try {
    app.run();
  } catch (e) {
    errorMsg = e.message;
    updateUI("error");
  }

  updateUI("finished");
}

self.addEventListener(
  "message",
  function (e) {
    editorid = e.data["editorid"];
    var sourcecode = e.data["sourcecode"];
    //    e.data['keyboardbuffer'];
    //    e.data['runspeed'];

    runWorker(sourcecode);
  },
  false
);
