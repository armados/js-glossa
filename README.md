# Διερμηνευτής ΓλώσσαJS
Υλοποίηση της γλώσσας προγραμματισμού ΓΛΩΣΣΑ σε Javascript.

## Συναρμολόγηση κώδικα 
```
npm run-script build
```
Μετά την εκτέλεση της παραπάνω εντολής θα δημιουργηθεί στον φάκελο `dist/js` το αρχείο `glossajs.min.js`

#### Παράδειγμα 
```html
  <script src="glossajs.min.js"></script>

  <script>
    var app = new GLO.GlossaJS();

    app.init();
    app.setSourceCode(glocode);

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
  </script>
```


## Δημιουργία εκτελέσιμων αρχείων για Windows, Linux και MacOS
```
npm run-script binary
```
Μετά την εκτέλεση της παραπάνω εντολής Θα δημιουργηθούν μέσα στον φάκελο `dist/binary` τα εκτελέσιμα standalone αρχεία `glossa-cli-win.exe`, `glossa-cli-linux` και `glossa-cli-macos`

#### Παράδειγμα
```dos
glossa-cli-win.exe -i code.glo
```

## Online χρήση του διερμηνευτή 

Ο φάκελος `tests/www-editor` περιέχει κώδικα για εκτέλεση του διερμηνευτή από φυλλομετρητή.

Η δοκιμαστική online έκδοση του διερμηνευτή υπάρχει στην ιστοσελίδα http://armadosvm.sch.gr/glo 
