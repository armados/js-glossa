"use strict";

const GE = require("./gclasses");

function isFloat(val) {
  return typeof val == "number" && Number(val) === val && val % 1 !== 0;
}
function isInt(val) {
  return typeof val == "number" && Number(val) === val && val % 1 === 0;
}
function isNumber(val) {
  return typeof val == "number" && Number(val) === val;
}
function isString(val) {
  return typeof val == "string";
}
function isBoolean(val) {
  return typeof val == "boolean";
}

function StringIsNumFloat(val) {
  return !isNaN(parseFloat(val)) && String(parseFloat(val)) == val;
}

function StringIsNumInt(val) {
  return !isNaN(parseInt(val)) && String(parseInt(val)) == val;
}

function displayValueInt(val) {
  return val;
}

function displayValueFloat(val) {
  return Math.round(val * 100) / 100;
}

function displayValueString(val) {
  return val;
}

function displayValueBoolean(val) {
  return val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ";
}

function formatValueForOutput(val) {
  if (isInt(val)) return displayValueInt(val);
  else if (isFloat(val)) return displayValueFloat(val);
  else if (isString(val)) return displayValueString(val);
  else if (isBoolean(val)) return displayValueBoolean(val);
  else throw GE.GInternalError("Unknown value");
}

function valueTypeToString(obj) {
  const STR = require("./storage");

  var val = obj.val;

  if (obj instanceof STR.STRTableNameInt) {
    return (
      "[ " + obj.tblname + " ] Πίνακας Ακεραίων [" + obj.tblsize.join(",") + "]"
    );
  } else if (obj instanceof STR.STRTableNameFloat) {
    return (
      "[ " +
      obj.tblname +
      " ] Πίνακας Πραγματικών [" +
      obj.tblsize.join(",") +
      "]"
    );
  } else if (obj instanceof STR.STRTableNameString) {
    return (
      "[ " +
      obj.tblname +
      " ] Πίνακας Χαρακτήρων [" +
      obj.tblsize.join(",") +
      "]"
    );
  } else if (obj instanceof STR.STRTableNameBoolean) {
    return (
      "[ " + obj.tblname + " ] Πίνακας Λογικών [" + obj.tblsize.join(",") + "]"
    );
  } else if (isInt(val)) {
    return "[ " + val + " ] Ακέραια σταθερά";
  } else if (isFloat(val)) {
    return "[ " + val + " ] Πραγματική σταθερά";
  } else if (isString(val)) {
    return "[ '" + val + "' ] Αλφαριθμητική σταθερά";
  } else if (isBoolean(val)) {
    return "[ " + (val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ") + " ] Λογική σταθερά";
  } else {
    throw new GE.GInternalError("Άγνωστη τιμή: " + val);
  }
}

async function sleepFunc(ms) {
  let promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });

  await promise;
}

module.exports = {
  isFloat,
  isInt,
  isNumber,
  isString,
  isBoolean,
  StringIsNumFloat,
  StringIsNumInt,
  formatValueForOutput,
  valueTypeToString,
  sleepFunc,
};
