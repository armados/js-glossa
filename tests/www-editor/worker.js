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

  if (errorMsg != null)  {
    console.log('ERROR IN WORKER: ' + errorMsg);
    updateUI("error");
  }

  updateUI("finished");
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
      throw new Error("Worker: Invalid command: "+method);
  }
}






self.addEventListener(
  "message",
  function (event) {
    var method = event.data[0] || null;
    editorid = event.data[1] || null;
    var data = event.data[2] || null;

    switch (method) {
      case "run":
        var sourcecode = data[0];
        var keyboardbuffer = data[1];
        var slowrun = data[2];
        runWorker(sourcecode, keyboardbuffer, slowrun);
        console.log('running worker started');
        break;
  
      case "ping":
        console.log('Worker ping: ' + data);
        break;
    }
  

  },
  false
);
