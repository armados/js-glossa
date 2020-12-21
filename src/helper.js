"use strict";

//class Helper {
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
  function  isBoolean(val) {
    return typeof val == "boolean";
  }

  function  valueTypeToString(obj) {
    var val = obj.val;
    if (isInt(val)) return "[ " + val + " ] Ακέραια σταθερά";
    else if (isFloat(val)) return "[ " + val + " ] Πραγματική σταθερά";
    else if (isString(val)) return "[ '" + val + "' ] Αλφαριθμητική σταθερά";
    else if (isBoolean(val))
      return "[ " + (val ? "ΑΛΗΘΗΣ" : "ΨΕΥΔΗΣ") + " ] Λογική σταθερά";
    else console.log(obj);
    //else throw new GE.GError("Critical: Unknown value type: " + val);
  }
//}

module.exports = {
    isFloat,
    isInt,
    isNumber,
    isString,
    isBoolean,
    valueTypeToString
};
