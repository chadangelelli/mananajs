/* parser generated by jison 0.4.13 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var manana_parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"program":3,"prog_list":4,"EOF":5,"stmt":6,"block":7,"INDENT":8,"stmt_list":9,"DEDENT":10,"tag_stmt":11,"void_tag_stmt":12,"filter_stmt":13,"tag":14,"END_TAG":15,"text":16,"tag_attrs":17,"TAG":18,"void_tag":19,"VOID_TAG":20,"tag_attr":21,"tag_attr_hash":22,"TAG_ID":23,"tag_classes":24,"TAG_ATTR":25,"EQ":26,"string":27,"TAG_DATA_ATTR":28,"TAG_CLASS":29,"FILTER":30,"word_list":31,"WORD":32,"path":33,"DOT":34,"ID":35,"INDEX":36,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",8:"INDENT",10:"DEDENT",15:"END_TAG",18:"TAG",20:"VOID_TAG",22:"tag_attr_hash",23:"TAG_ID",25:"TAG_ATTR",26:"EQ",27:"string",28:"TAG_DATA_ATTR",29:"TAG_CLASS",30:"FILTER",32:"WORD",34:"DOT",35:"ID",36:"INDEX"},
productions_: [0,[3,2],[4,2],[4,1],[7,3],[9,2],[9,1],[6,1],[6,1],[6,1],[11,2],[11,3],[11,3],[11,3],[11,4],[11,4],[14,1],[12,2],[12,3],[19,1],[17,2],[17,1],[17,1],[21,1],[21,1],[21,3],[21,3],[24,2],[24,1],[13,4],[16,1],[31,2],[31,1],[33,3],[33,2],[33,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1: 
      console.log("\n\n==>\n", JSON.stringify($$[$0-1],null, "\t"));
      console.log("\n\n==> %j\n", $$[$0-1]); 
      return $$[$0-1];
    
break;
case 2: $$[$0-1].push($$[$0]); this.$ = $$[$0-1]; 
break;
case 3: this.$ = [$$[$0]]; 
break;
case 4: this.$ = $$[$0-1]; 
break;
case 5: $$[$0-1].push($$[$0]); this.$ = $$[$0-1]; 
break;
case 6: this.$ = [$$[$0]]; 
break;
case 10: this.$ = $$[$0-1]; 
break;
case 11: this.$ = $$[$0-2]; this.$.push($$[$0-1]); 
break;
case 12: this.$ = $$[$0-2]; this.$.push($$[$0]); 
break;
case 13: this.$ = $$[$0-2]; this.$[1].push.apply(this.$[1], $$[$0-1]); 
break;
case 14: this.$ = $$[$0-3]; this.$[1].push.apply(this.$[1], $$[$0-2]); this.$.push($$[$0-2]); 
break;
case 15: this.$ = $$[$0-3]; this.$[1].push.apply(this.$[1], $$[$0-2]); this.$.push($$[$0]); 
break;
case 16: this.$ = ['TAG', [$$[$0]]]; 
break;
case 17: this.$ = $$[$0-1]; 
break;
case 18: this.$ = $$[$0-2]; this.$[1].push.apply(this.$[1], $$[$0-1]); 
break;
case 19: this.$ = ['VOID_TAG', $$[$0]]; 
break;
case 20: this.$ = $$[$0-1]; this.$.push($$[$0]); 
break;
case 21: this.$ = [$$[$0]]; 
break;
case 22: this.$ = $$[$0]; 
break;
case 23: this.$ = ['ID', $$[$0]]; 
break;
case 24: this.$ = ['CLASS']; this.$.push.apply(this.$, $$[$0]); 
break;
case 25: this.$ = ['ATTR', $$[$0-2], $$[$0]]; 
break;
case 26: this.$ = ['DATA', $$[$0-2], $$[$0]]; 
break;
case 27: this.$ = $$[$0-1]; this.$.push($$[$0]); 
break;
case 28: this.$ = [$$[$0]]; 
break;
case 29: this.$ = ['FILTER', $$[$0-3], $$[$0-1]]; 
break;
case 30: this.$ = ['TEXT', $$[$0].join(' ')]; 
break;
case 31: this.$ = $$[$0-1]; this.$.push($$[$0]); 
break;
case 32: this.$ = [$$[$0]]; 
break;
case 33: this.$ = $$[$0-2]; this.$.push($$[$0]); 
break;
case 34: this.$ = $$[$0-1]; this.$.push($$[$0]); 
break;
case 35: this.$ = ['PATH', $$[$0]]; 
break;
}
},
table: [{3:1,4:2,6:3,11:4,12:5,13:6,14:7,18:[1,10],19:8,20:[1,11],30:[1,9]},{1:[3]},{5:[1,12],6:13,11:4,12:5,13:6,14:7,18:[1,10],19:8,20:[1,11],30:[1,9]},{5:[2,3],18:[2,3],20:[2,3],30:[2,3]},{5:[2,7],10:[2,7],18:[2,7],20:[2,7],30:[2,7]},{5:[2,8],10:[2,8],18:[2,8],20:[2,8],30:[2,8]},{5:[2,9],10:[2,9],18:[2,9],20:[2,9],30:[2,9]},{15:[1,14],16:15,17:16,21:18,22:[1,19],23:[1,21],24:22,25:[1,23],28:[1,24],29:[1,25],31:17,32:[1,20]},{15:[1,26],17:27,21:18,22:[1,19],23:[1,21],24:22,25:[1,23],28:[1,24],29:[1,25]},{8:[1,28]},{15:[2,16],22:[2,16],23:[2,16],25:[2,16],28:[2,16],29:[2,16],32:[2,16]},{15:[2,19],22:[2,19],23:[2,19],25:[2,19],28:[2,19],29:[2,19]},{1:[2,1]},{5:[2,2],18:[2,2],20:[2,2],30:[2,2]},{5:[2,10],7:29,8:[1,30],10:[2,10],18:[2,10],20:[2,10],30:[2,10]},{15:[1,31]},{15:[1,32],16:33,21:34,23:[1,21],24:22,25:[1,23],28:[1,24],29:[1,25],31:17,32:[1,20]},{10:[2,30],15:[2,30],32:[1,35]},{15:[2,21],23:[2,21],25:[2,21],28:[2,21],29:[2,21],32:[2,21]},{15:[2,22],23:[2,22],25:[2,22],28:[2,22],29:[2,22],32:[2,22]},{10:[2,32],15:[2,32],32:[2,32]},{15:[2,23],23:[2,23],25:[2,23],28:[2,23],29:[2,23],32:[2,23]},{15:[2,24],23:[2,24],25:[2,24],28:[2,24],29:[1,36],32:[2,24]},{26:[1,37]},{26:[1,38]},{15:[2,28],23:[2,28],25:[2,28],28:[2,28],29:[2,28],32:[2,28]},{5:[2,17],10:[2,17],18:[2,17],20:[2,17],30:[2,17]},{15:[1,39],21:34,23:[1,21],24:22,25:[1,23],28:[1,24],29:[1,25]},{16:40,31:17,32:[1,20]},{5:[2,12],10:[2,12],18:[2,12],20:[2,12],30:[2,12]},{6:42,9:41,11:4,12:5,13:6,14:7,18:[1,10],19:8,20:[1,11],30:[1,9]},{5:[2,11],10:[2,11],18:[2,11],20:[2,11],30:[2,11]},{5:[2,13],7:43,8:[1,30],10:[2,13],18:[2,13],20:[2,13],30:[2,13]},{15:[1,44]},{15:[2,20],23:[2,20],25:[2,20],28:[2,20],29:[2,20],32:[2,20]},{10:[2,31],15:[2,31],32:[2,31]},{15:[2,27],23:[2,27],25:[2,27],28:[2,27],29:[2,27],32:[2,27]},{27:[1,45]},{27:[1,46]},{5:[2,18],10:[2,18],18:[2,18],20:[2,18],30:[2,18]},{10:[1,47]},{6:49,10:[1,48],11:4,12:5,13:6,14:7,18:[1,10],19:8,20:[1,11],30:[1,9]},{10:[2,6],18:[2,6],20:[2,6],30:[2,6]},{5:[2,15],10:[2,15],18:[2,15],20:[2,15],30:[2,15]},{5:[2,14],10:[2,14],18:[2,14],20:[2,14],30:[2,14]},{15:[2,25],23:[2,25],25:[2,25],28:[2,25],29:[2,25],32:[2,25]},{15:[2,26],23:[2,26],25:[2,26],28:[2,26],29:[2,26],32:[2,26]},{5:[2,29],10:[2,29],18:[2,29],20:[2,29],30:[2,29]},{5:[2,4],10:[2,4],18:[2,4],20:[2,4],30:[2,4]},{10:[2,5],18:[2,5],20:[2,5],30:[2,5]}],
defaultActions: {12:[2,1]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == 'undefined') {
        this.lexer.yylloc = {};
    }
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === 'function') {
        this.parseError = this.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = tstack.shift() || self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
            if (token instanceof Array) {
                tstack = tstack.concat(token.splice(1));
                token = token[0];
            }
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: this.lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: this.lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                this.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.2.1 */
var lexer = (function(){
var lexer = {

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input) {
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
 
  function strip(start, end) {
    return yy_.yytext = yy_.yytext.substr(start, yy_.yyleng-end);
  }

var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:this.pushState("comment"); /* ignore */ 
break;
case 1:this.popState(); /* ignore */ 
break;
case 2:/* ignore */
break;
case 3:/* ignore */
break;
case 4:this.pushState("tag"); return "TAG";
break;
case 5:this.pushState("tag"); yy_.yytext = yy_.yytext.slice(1); return "VOID_TAG";
break;
case 6:this.popState(); return "END_TAG";
break;
case 7:yy_.yytext = yy_.yytext.slice(1); return "TAG_ID";
break;
case 8:yy_.yytext = yy_.yytext.slice(1); return "TAG_CLASS";
break;
case 9:this.pushState("filter"); yy_.yytext = yy_.yytext.slice(1); return "FILTER";
break;
case 10:return "WORD";
break;
case 11:return 5;
break;
case 12:
  var tokens = [];
  while (0 < _indent_stack[0]) {
    this.popState();
    tokens.unshift("DEDENT");
    _indent_stack.shift();
  }
  if (tokens.length) return tokens;

break;
case 13:/* eat blank lines */
break;
case 14:
  var indentation = yy_.yytext.length - yy_.yytext.search(/\s/) - 1;
  if (indentation > _indent_stack[0]) {
    _indent_stack.unshift(indentation);
    return 8;
  }
  var tokens = [];
  while (indentation < _indent_stack[0]) {
    this.popState();
    tokens.unshift("DEDENT");
    _indent_stack.shift();
  }
  if (tokens.length) return tokens;

break;
case 15:/* ignore all other whitespace */
break;
}
},
rules: [/^(?:""")/,/^(?:""")/,/^(?:.+)/,/^(?:\n)/,/^(?:([a-zA-Z_][a-zA-Z0-9_]{0,254}))/,/^(?:(!(area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)))/,/^(?:(?=\n))/,/^(?:(#[a-zA-Z][a-zA-Z0-9\-\:_]*))/,/^(?:(\.-?[_a-zA-Z]+[_a-zA-Z0-9\-]*(?=["."\s\n])))/,/^(?::([a-zA-Z_][a-zA-Z0-9_]{0,254}))/,/^(?:([^"{""!"\s\n][^\s\n]*))/,/^(?:$)/,/^(?:\s*$)/,/^(?:[\n\r]+([\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000])*(?![^\n\r]))/,/^(?:[\n\r]([\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000])*)/,/^(?:([\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000])+)/],
conditions: {"comment":{"rules":[1,2,3,11,13,15],"inclusive":true},"tag":{"rules":[6,7,8,10,11,13,15],"inclusive":true},"filter":{"rules":[10,11,12,13,14,15],"inclusive":true},"INITIAL":{"rules":[0,4,5,9,10,11,12,13,14,15],"inclusive":true}}
};
_indent_stack = [0];;
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = manana_parser;
exports.Parser = manana_parser.Parser;
exports.parse = function () { return manana_parser.parse.apply(manana_parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}