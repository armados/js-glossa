# Διερμηνευτής ΓλώσσαJS

## Συναρμολόγηση κώδικα Javascript 
```
npm run-script build
```
Μετά την εκτέλεση της παραπάνω εντολής θα δημιουργηθεί στον φάκελο `dist/js` το τελικό αρχείο `glossajs.min.js` του διευρμηνευτή.

```javascript
  var app = new GLO.GlossaJS();

  app.init();
  app.setSourceCode(sourcecode);
  app.setDebugMode(false);

  app.setReadInputFunction(function (name) {
    return prompt();
  });
  
  app.on("outputappend", (data) => {
    console.log(data);
  });

  app.on("error", (data) => {
    console.log(data);
  });

  app.run();
```


## Δημιουργία εκτελέσιμων αρχείων για Windows, Linux και MacOS
```
npm run-script binary
```
Μετά την εκτέλεση της παραπάνω εντολής Θα δημιουργηθούν μέσα στον φάκελο `dist/binary` τα εκτελέσιμα standalone αρχεία `glossa-cli-win.exe`, `glossa-cli-linux` και `glossa-cli-macos`

## Online χρήση του διερμηνευτή 

Ο φάκελος `tests/www-editor` περιέχει κώδικα για εκτέλεση του διερμηνευτή από φυλλομετρητή.

Η δοκιμαστική online έκδοση του διερμηνευτή υπάρχει στην ιστοσελίδα http://armadosvm.sch.gr/glo 
