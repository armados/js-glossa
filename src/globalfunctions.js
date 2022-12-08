"use strict";

const GE = require("./gclasses");
const STR = require("./storage");
const HP = require("./helper");
const Atom = require("./atom");

class GlobalFunctions {
  applyAllFunctionsToScope(scope) {
    scope.addSymbol(
      "Α_Μ",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var lineCalled = arrArgs[2];

        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης Α_Μ.",
            lineCalled
          );

        if (A == null)
          throw new GE.GError(
            "Η παράμετρος της συνάρτησης Α_Μ δεν έχει αρχικοποιηθεί.",
            lineCalled
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση Α_Μ δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            lineCalled
          );

        // Use Math.floor or Math.trunc
        return new Atom.MNumber(Math.floor(A.val));
      })
    );

    scope.addSymbol(
      "Α_Τ",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var lineCalled = arrArgs[2];

        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης Α_Τ.",
            lineCalled
          );

        if (A == null)
          throw new GE.GError(
            "Η παράμετρος της συνάρτησης Α_Τ δεν έχει αρχικοποιηθεί.",
            lineCalled
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση Α_Τ δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            lineCalled
          );

        if (A.val < 0) return new Atom.MNumber(-A.val);
        return new Atom.MNumber(A.val);
      })
    );

    scope.addSymbol(
      "Τ_Ρ",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var lineCalled = arrArgs[2];

        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης Τ_Ρ.",
            lineCalled
          );

        if (A == null)
          throw new GE.GError(
            "Η παράμετρος της συνάρτησης Τ_Ρ δεν έχει αρχικοποιηθεί.",
            lineCalled
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση Τ_Ρ δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            lineCalled
          );

        if (A.val < 0)
          throw new GE.GError(
            "Η συνάρτηση Τ_Ρ δεν μπορεί να λάβει αρνητική τιμή.",
            lineCalled
          );

        return new Atom.MNumber(Math.sqrt(A.val));
      })
    );

    scope.addSymbol(
      "ΗΜ",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var lineCalled = arrArgs[2];

        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης ΗΜ.",
            lineCalled
          );

        if (A == null)
          throw new GE.GError(
            "Η παράμετρος της συνάρτησης ΗΜ δεν έχει αρχικοποιηθεί.",
            lineCalled
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση ΗΜ δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            lineCalled
          );

        const degrees = (A.val * Math.PI) / 180;

        return new Atom.MNumber(Math.sin(degrees));
      })
    );

    scope.addSymbol(
      "ΣΥΝ",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var lineCalled = arrArgs[2];

        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης ΣΥΝ.",
            lineCalled
          );

        if (A == null)
          throw new GE.GError(
            "Η παράμετρος της συνάρτησης ΣΥΝ δεν έχει αρχικοποιηθεί.",
            lineCalled
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση ΣΥΝ δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            lineCalled
          );

        const degrees = (A.val * Math.PI) / 180;

        return new Atom.MNumber(Math.cos(degrees));
      })
    );

    scope.addSymbol(
      "Ε",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var lineCalled = arrArgs[2];

        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης Ε.",
            lineCalled
          );

        if (A == null)
          throw new GE.GError(
            "Η παράμετρος της συνάρτησης Ε δεν έχει αρχικοποιηθεί.",
            lineCalled
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση Ε δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            lineCalled
          );

        return new Atom.MNumber(Math.exp(A.val));
      })
    );

    scope.addSymbol(
      "ΕΦ",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var lineCalled = arrArgs[2];

        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης ΕΦ.",
            lineCalled
          );

        if (A == null)
          throw new GE.GError(
            "Η παράμετρος της συνάρτησης ΕΦ δεν έχει αρχικοποιηθεί.",
            lineCalled
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση ΕΦ δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            lineCalled
          );

        const degrees = (A.val * Math.PI) / 180;

        return new Atom.MNumber(Math.tan(degrees));
      })
    );

    scope.addSymbol(
      "ΛΟΓ",
      new STR.STRBuiltinFunction(function (...arrArgs) {
        var args = arrArgs[0];
        var lineCalled = arrArgs[2];

        var A = args[0];

        if (args.length != 1)
          throw new GE.GError(
            "Λάθος αριθμός παραμέτρων κατά την κλήση της συνάρτησης ΛΟΓ.",
            lineCalled
          );

        if (A == null)
          throw new GE.GError(
            "Η παράμετρος της συνάρτησης ΛΟΓ δεν έχει αρχικοποιηθεί.",
            lineCalled
          );

        if (!HP.isNumber(A.val))
          throw new GE.GError(
            "Η συνάρτηση ΛΟΓ δεν μπορεί να δεχτεί αυτό το όρισμα." +
              "\n" +
              HP.valueTypeToString(A),
            lineCalled
          );

        if (A.val <= 0)
          throw new GE.GError(
            "Η συνάρτηση ΛΟΓ δεν μπορεί να δεχτεί αρνητικές τιμές ή το μηδέν.",
            lineCalled
          );

        return new Atom.MNumber(Math.log(A.val));
      })
    );
  }
}

module.exports = {
  GlobalFunctions,
};
