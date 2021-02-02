define('ace/mode/glossa', function(require, exports, module) {

    var oop = require("ace/lib/oop");
    var TextMode = require("ace/mode/text").Mode;
    var glossaHighlightRules = require("ace/mode/glossa_highlight_rules").glossaHighlightRules;
    
    var Mode = function() {
        this.HighlightRules = glossaHighlightRules;
    };
    oop.inherits(Mode, TextMode);
    
    (function() {
        // Extra logic goes here. (see below)
    }).call(Mode.prototype);
    
    exports.Mode = Mode;
    });
    
    define('ace/mode/glossa_highlight_rules', function(require, exports, module) {
    
    var oop = require("ace/lib/oop");
    var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;
    
    var glossaHighlightRules = function() {

        var keywords = (
            "|ΣΤΑΘΕΡΕΣ|ΜΕΤΑΒΛΗΤΕΣ" +
            "|ΑΝ|ΤΟΤΕ|ΑΛΛΙΩΣ|ΑΛΛΙΩΣ_ΑΝ|ΤΕΛΟΣ_ΑΝ"+
            "|ΕΠΙΛΕΞΕ|ΠΕΡΙΠΤΩΣΗ|ΠΕΡΙΠΤΩΣΗ ΑΛΛΙΩΣ|ΤΕΛΟΣ_ΕΠΙΛΟΓΩΝ"+
            "|ΟΣΟ|ΕΠΑΝΑΛΑΒΕ|ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ"+
            "|ΑΡΧΗ_ΕΠΑΝΑΛΗΨΗΣ|ΜΕΧΡΙΣ_ΟΤΟΥ"+
            "|ΓΙΑ|ΑΠΟ|ΜΕΧΡΙ|ΜΕ_ΒΗΜΑ|ΜΕ|ΒΗΜΑ" +
            "|ΓΡΑΨΕ|ΔΙΑΒΑΣΕ"+
            "|ΚΑΛΕΣΕ" +
            "|ΑΚΕΡΑΙΕΣ|ΠΡΑΓΜΑΤΙΚΕΣ|ΛΟΓΙΚΕΣ|ΧΑΡΑΚΤΗΡΕΣ"+
            "|ΑΚΕΡΑΙΑ|ΠΡΑΓΜΑΤΙΚΗ|ΧΑΡΑΚΤΗΡΑΣ|ΛΟΓΙΚΗ"
    );
    
        var buildinConstants = (
            "DIV|MOD|ΚΑΙ|Η|Ή|ΟΧΙ|ΌΧΙ"
            );
    
        var builtinFunctions = (
            "Α_Τ|Α_Μ|Τ_Ρ|Ε|ΗΜ|ΣΥΝ|ΕΦ|ΛΟΓ"
        );


        var keywordMapper = this.createKeywordMapper({
            "keyword": keywords,
            "storage.type": "ΠΡΟΓΡΑΜΜΑ|ΑΡΧΗ|ΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ|ΣΥΝΑΡΤΗΣΗ|ΔΙΑΔΙΚΑΣΙΑ|ΤΕΛΟΣ_ΣΥΝΑΡΤΗΣΗΣ|ΤΕΛΟΣ_ΔΙΑΔΙΚΑΣΙΑΣ",
            "constant.language": buildinConstants,
            "constant.language.boolean": "ΑΛΗΘΗΣ|ΨΕΥΔΗΣ",
            "support.function": builtinFunctions
        }, "identifier", true);
 

        this.$rules = {
            start: [{
                caseInsensitive: true,
                token: ['variable', "text",
                    'storage.type.prototype',
                    'entity.name.function.prototype'
                ],
                regex: '\\b(ΣΥΝΑΡΤΗΣΗ|ΔΙΑΔΙΚΑΣΙΑ)(\\s+)(\\w+)(\\.\\w+)?(?=(?:\\(.*?\\))?;\\s*(?:attribute|forward|external))'
            }, {
                token: 'constant.numeric',
                regex: '\\b((0(x|X)[0-9a-fA-F]*)|(([0-9]+\\.?[0-9]*)|(\\.[0-9]+))((e|E)(\\+|-)?[0-9]+)?)(L|l|UL|ul|u|U|F|f|ll|LL|ull|ULL)?\\b'
            }, {
                token: 'punctuation.definition.comment',
                regex: '!.*$'
            }, {
                token: 'punctuation.definition.string.begin',
                regex: '"',
                push: [{ token: 'constant.character.escape', regex: '\\\\.' },
                    {
                        token: 'punctuation.definition.string.end',
                        regex: '"',
                        next: 'pop'
                    },
                    { defaultToken: 'string.quoted.double' }
                ]
            }, {
                token: 'punctuation.definition.string.begin',
                regex: '\'',
                push: [{
                        token: 'constant.character.escape.apostrophe',
                        regex: '\'\''
                    },
                    {
                        token: 'punctuation.definition.string.end',
                        regex: '\'',
                        next: 'pop'
                    },
                    { defaultToken: 'string.quoted.single' }
                ]
            }, {
                token : "punctuation.operator",
                regex : '(:|\\<\\-)'
            }, {
                caseInsensitive: true,
                token: keywordMapper,
                regex: '[Ά-Ώά-ώΑ-Ωα-ωA-Za-z$][Ά-Ώά-ώΑ-Ωα-ωA-Za-z0-9_$]*', //'\[Ά-Ώά-ώΑ-Ωα-ωA-Za-z$][_Ά-Ώά-ώΑ-Ωα-ωA-Za-z0-9$]*'
            }, {
                token: 'keyword.operator',
                regex: '\\+|\\-|\\*|\\^|\\/|\\=|\\<|\\>|\\<\\=|\\>\\=|\\<\\>'
            }, {
                token : "paren.lparen",
                regex : "[\\[({]"
            }, {
                token : "paren.rparen",
                regex : "[\\])}]"
            }
            ]
        };
    
        this.normalizeRules();
    };
    
    oop.inherits(glossaHighlightRules, TextHighlightRules);
    
    exports.glossaHighlightRules = glossaHighlightRules;
    });