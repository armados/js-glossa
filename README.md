# Διερμηνευτής ΓλώσσαJS
Υλοποίηση της γλώσσας προγραμματισμού ΓΛΩΣΣΑ σε Javascript.

## Δημιουργία εκτελέσιμων αρχείων για Windows, Linux και MacOS
```
npm run-script binary
```
Μετά την εκτέλεση της παραπάνω εντολής Θα δημιουργηθούν μέσα στον φάκελο `dist/binary` τα εκτελέσιμα standalone αρχεία `glossa-cli-win.exe`, `glossa-cli-linux` και `glossa-cli-macos`

#### Παράδειγμα
```dos
glossa-cli-win.exe -i code.glo
```

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

## Online περιβάλλον του διερμηνευτή 

Ο φάκελος `tests/www-editor` περιέχει κώδικα για εκτέλεση του διερμηνευτή από φυλλομετρητή.

Η δοκιμαστική έκδοση του διερμηνευτή υπάρχει στην ιστοσελίδα http://armadosvm.sch.gr/glo 


## Online Quiz στη ΓΛΩΣΣΑ στην πλατφόρμα Moodle 

Ο διευρμηνευτής μπορεί να χρησιμοποιηθεί στην πλατφόρμα Moodle με το πρόσθετο Coderunner.

```python
import subprocess, sys
# Write the student code to a file code.glo
student_answer = """
{{ STUDENT_ANSWER | e('py') }}
"""
with open("code.glo", "w") as src:
    print(student_answer, file=src)
try:
    output = subprocess.check_output(["glossa-cli", "-i", "code.glo", "-k", "prog.in"], universal_newlines=True)
    print(output)
except subprocess.CalledProcessError as e:
    if e.returncode > 0:
        # Ignore non-zero positive return codes
        if e.output:
            print(e.output)
    else:
        # But negative return codes are signals - abort
        if e.output:
            print(e.output, file=sys.stderr)
        if e.returncode < 0:
            print("Task failed with signal", -e.returncode, file=sys.stderr)
        print("** Further testing aborted **", file=sys.stderr)
```

#### Παράδειγμα 
Quiz της ΓΛΩΣΣΑΣ στη διεύθυνση https://moodle.armados.org/course/view.php?id=12 (στοιχεία σύνδεσης χρήστης:testuser κωδικός:testpass)

