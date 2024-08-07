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

module.exports = {
  isFloat,
  isInt,
  isNumber,
  isString,
  isBoolean,
  StringIsNumFloat,
  StringIsNumInt,
  valueTypeToString,
};
