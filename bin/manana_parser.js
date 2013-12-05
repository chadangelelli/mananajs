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
symbols_: {"error":2,"program":3,"prog_list":4,"EOF":5,"stmt":6,"stmt_block":7,"INDENT":8,"stmt_list":9,"DEDENT":10,"tag_stmt":11,"void_tag_stmt":12,"for_stmt":13,"text":14,"fn":15,"tag":16,"END_TAG":17,"tag_attrs":18,"tag_text":19,"TAG":20,"void_tag":21,"VOID_TAG":22,"tag_attr":23,"tag_attr_hash":24,"TAG_ID":25,"tag_classes":26,"TAG_ATTR":27,"EQ":28,"string":29,"TAG_DATA_ATTR":30,"TAG_ATTR_HASH":31,"tag_attr_hash_attrs":32,"END_ATTR_HASH":33,"tag_attr_hash_attr":34,"COLON":35,"STRING":36,"COMMA":37,"tag_class":38,"TAG_CLASS":39,"TAG_TEXT":40,"FOR":41,"id":42,"IN":43,"END_EXPR":44,"FN":45,"END_FN":46,"fn_args":47,"CHAINED_FN":48,"fn_arg":49,"path":50,"FLOAT":51,"UFLOAT":52,"INT":53,"UINT":54,"DOT":55,"path_el":56,"ID":57,"TEXT":58,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",8:"INDENT",10:"DEDENT",17:"END_TAG",20:"TAG",22:"VOID_TAG",25:"TAG_ID",27:"TAG_ATTR",28:"EQ",30:"TAG_DATA_ATTR",31:"TAG_ATTR_HASH",33:"END_ATTR_HASH",35:"COLON",36:"STRING",37:"COMMA",39:"TAG_CLASS",40:"TAG_TEXT",41:"FOR",43:"IN",44:"END_EXPR",45:"FN",46:"END_FN",48:"CHAINED_FN",51:"FLOAT",52:"UFLOAT",53:"INT",54:"UINT",55:"DOT",57:"ID",58:"TEXT"},
productions_: [0,[3,2],[4,2],[4,1],[7,3],[9,2],[9,1],[6,1],[6,1],[6,1],[6,1],[6,1],[11,2],[11,3],[11,3],[11,4],[11,3],[11,4],[11,4],[11,5],[16,1],[12,2],[12,3],[21,1],[18,2],[18,1],[18,1],[23,1],[23,1],[23,3],[23,3],[24,3],[32,2],[32,1],[34,3],[34,4],[34,3],[34,4],[26,2],[26,1],[38,1],[19,1],[13,6],[13,8],[13,10],[15,2],[15,3],[15,4],[47,3],[47,1],[49,1],[49,1],[49,1],[49,1],[49,1],[49,1],[50,3],[50,1],[56,1],[14,1],[42,1],[29,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1: 
      console.log("\n\n==>\n", JSON.stringify($$[$0-1],null, "\t"));
      console.log("\n\n==>%j\n", $$[$0-1]); 
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
case 12: this.$ = $$[$0-1]; 
break;
case 13: this.$ = $$[$0-2]; this.$.push($$[$0]); 
break;
case 14: this.$ = $$[$0-2]; this.$[1].push.apply(this.$[1], $$[$0-1]); 
break;
case 15: this.$ = $$[$0-3]; this.$[1].push.apply(this.$[1], $$[$0-2]); this.$.push($$[$0]); 
break;
case 16: this.$ = $$[$0-2]; this.$.push([$$[$0-1]]); 
break;
case 17: this.$ = $$[$0-3]; this.$[1].push.apply(this.$[1], $$[$0-2]); this.$.push([$$[$0-1]]); 
break;
case 18: 
                                                  this.$ = $$[$0-3]; 
                                                  var a = [$$[$0-2]];
                                                  a.push.apply(a, $$[$0]);
                                                  this.$.push(a);
                                                
break;
case 19: 
                                                  this.$ = $$[$0-4]; 
                                                  this.$[1].push.apply(this.$[1], $$[$0-3]); 
                                                  var a = [$$[$0-2]];
                                                  a.push.apply(a, $$[$0]);
                                                  this.$.push(a);
                                                
break;
case 20: this.$ = ['TAG', [['NAME', $$[$0].slice(1)]]]; 
break;
case 21: this.$ = $$[$0-1]; 
break;
case 22: this.$ = $$[$0-2]; this.$[1].push.apply(this.$[1], $$[$0-1]); 
break;
case 23: this.$ = ['VOID_TAG', [['NAME', $$[$0].slice(1)]]]; 
break;
case 24: this.$ = $$[$0-1]; this.$.push($$[$0]); 
break;
case 25: this.$ = [$$[$0]]; 
break;
case 26: this.$ = $$[$0]; 
break;
case 27: this.$ = ['ID', $$[$0].slice(1)]; 
break;
case 28: this.$ = $$[$0]; 
break;
case 29: this.$ = ['ATTR', $$[$0-2], $$[$0]]; 
break;
case 30: this.$ = ['DATA', $$[$0-2].slice(1), $$[$0]]; 
break;
case 31: this.$ = $$[$0-1]; 
break;
case 32: this.$ = $$[$0-1]; this.$.push($$[$0]); 
break;
case 33: this.$ = [$$[$0]]; 
break;
case 34: this.$ = [$$[$0-2], $$[$0]]; 
break;
case 35: this.$ = [$$[$0-3], $$[$0-1]]; 
break;
case 36: this.$ = [$$[$0-2], $$[$0]]; 
break;
case 37: this.$ = [$$[$0-3], $$[$0-1]]; 
break;
case 38: this.$ = $$[$0-1]; this.$.push($$[$0]); 
break;
case 39: this.$ = ['CLASS', $$[$0]]; 
break;
case 40: this.$ = $$[$0].slice(1); 
break;
case 41: this.$ = ['TEXT', $$[$0].replace(/^\s*~\s*/, '')]; 
break;
case 42: this.$ = ['FOR', [$$[$0-4], $$[$0-2]], $$[$0]]; 
break;
case 43: this.$ = ['FOR', [$$[$0-6], $$[$0-4], $$[$0-2]], $$[$0]]; 
break;
case 44: this.$ = ['FOR', [$$[$0-8], $$[$0-6], $$[$0-4], $$[$0-2]], $$[$0]]; 
break;
case 45: 
                                     var fn_name = $$[$0-1].slice(1, $$[$0-1].length-1);
                                     if ( ! fn_name) fn_name = '@';
                                     this.$ = ['FN', [['NAME', fn_name]]]; 
                                   
break;
case 46: 
                                     var fn_name = $$[$0-2].slice(1, $$[$0-2].length-1);
                                     if ( ! fn_name) fn_name = '@';
                                     this.$ = ['FN', [['NAME', fn_name]]]; this.$[1].push.apply(this.$[1], $$[$0-1]); 
                                   
break;
case 47: this.$ = ['x']; 
break;
case 48: this.$ = $$[$0-2]; this.$.push($$[$0]); 
break;
case 49: this.$ = [$$[$0]]; 
break;
case 56: this.$ = $$[$0-2]; this.$.push($$[$0]); 
break;
case 57: this.$ = ['PATH', $$[$0]]; 
break;
case 58: this.$ = $$[$0]; 
break;
case 59: this.$ = ['TEXT', $$[$0]]; 
break;
case 60: this.$ = ['ID', $$[$0]]; 
break;
case 61: this.$ = $$[$0].slice(1, $$[$0].length-1); 
break;
}
},
table: [{3:1,4:2,6:3,11:4,12:5,13:6,14:7,15:8,16:9,20:[1,14],21:10,22:[1,15],41:[1,11],45:[1,13],58:[1,12]},{1:[3]},{5:[1,16],6:17,11:4,12:5,13:6,14:7,15:8,16:9,20:[1,14],21:10,22:[1,15],41:[1,11],45:[1,13],58:[1,12]},{5:[2,3],20:[2,3],22:[2,3],41:[2,3],45:[2,3],58:[2,3]},{5:[2,7],10:[2,7],20:[2,7],22:[2,7],41:[2,7],45:[2,7],58:[2,7]},{5:[2,8],10:[2,8],20:[2,8],22:[2,8],41:[2,8],45:[2,8],58:[2,8]},{5:[2,9],10:[2,9],20:[2,9],22:[2,9],41:[2,9],45:[2,9],58:[2,9]},{5:[2,10],10:[2,10],20:[2,10],22:[2,10],41:[2,10],45:[2,10],58:[2,10]},{5:[2,11],10:[2,11],20:[2,11],22:[2,11],41:[2,11],45:[2,11],58:[2,11]},{17:[1,18],18:19,19:20,23:21,24:22,25:[1,24],26:25,27:[1,26],30:[1,27],31:[1,28],38:29,39:[1,30],40:[1,23]},{17:[1,31],18:32,23:21,24:22,25:[1,24],26:25,27:[1,26],30:[1,27],31:[1,28],38:29,39:[1,30]},{42:33,57:[1,34]},{5:[2,59],10:[2,59],20:[2,59],22:[2,59],41:[2,59],45:[2,59],58:[2,59]},{29:39,36:[1,45],46:[1,35],47:36,49:37,50:38,51:[1,40],52:[1,41],53:[1,42],54:[1,43],56:44,57:[1,46]},{17:[2,20],25:[2,20],27:[2,20],30:[2,20],31:[2,20],39:[2,20],40:[2,20]},{17:[2,23],25:[2,23],27:[2,23],30:[2,23],31:[2,23],39:[2,23]},{1:[2,1]},{5:[2,2],20:[2,2],22:[2,2],41:[2,2],45:[2,2],58:[2,2]},{5:[2,12],7:47,8:[1,48],10:[2,12],20:[2,12],22:[2,12],41:[2,12],45:[2,12],58:[2,12]},{17:[1,49],19:50,23:51,25:[1,24],26:25,27:[1,26],30:[1,27],38:29,39:[1,30],40:[1,23]},{17:[1,52]},{17:[2,25],25:[2,25],27:[2,25],30:[2,25],39:[2,25],40:[2,25]},{17:[2,26],25:[2,26],27:[2,26],30:[2,26],39:[2,26],40:[2,26]},{17:[2,41]},{17:[2,27],25:[2,27],27:[2,27],30:[2,27],39:[2,27],40:[2,27]},{17:[2,28],25:[2,28],27:[2,28],30:[2,28],38:53,39:[1,30],40:[2,28]},{28:[1,54]},{28:[1,55]},{27:[1,58],30:[1,59],32:56,34:57},{17:[2,39],25:[2,39],27:[2,39],30:[2,39],39:[2,39],40:[2,39]},{17:[2,40],25:[2,40],27:[2,40],30:[2,40],39:[2,40],40:[2,40]},{5:[2,21],10:[2,21],20:[2,21],22:[2,21],41:[2,21],45:[2,21],58:[2,21]},{17:[1,60],23:51,25:[1,24],26:25,27:[1,26],30:[1,27],38:29,39:[1,30]},{37:[1,62],43:[1,61]},{37:[2,60],43:[2,60],44:[2,60]},{5:[2,45],10:[2,45],20:[2,45],22:[2,45],41:[2,45],45:[2,45],58:[2,45]},{37:[1,64],46:[1,63]},{37:[2,49],46:[2,49]},{37:[2,50],46:[2,50],55:[1,65]},{37:[2,51],46:[2,51]},{37:[2,52],46:[2,52]},{37:[2,53],46:[2,53]},{37:[2,54],46:[2,54]},{37:[2,55],46:[2,55]},{37:[2,57],46:[2,57],55:[2,57]},{17:[2,61],25:[2,61],27:[2,61],30:[2,61],37:[2,61],39:[2,61],40:[2,61],46:[2,61]},{37:[2,58],46:[2,58],55:[2,58]},{5:[2,13],10:[2,13],20:[2,13],22:[2,13],41:[2,13],45:[2,13],58:[2,13]},{6:67,9:66,11:4,12:5,13:6,14:7,15:8,16:9,20:[1,14],21:10,22:[1,15],41:[1,11],45:[1,13],58:[1,12]},{5:[2,14],7:68,8:[1,48],10:[2,14],20:[2,14],22:[2,14],41:[2,14],45:[2,14],58:[2,14]},{17:[1,69]},{17:[2,24],25:[2,24],27:[2,24],30:[2,24],39:[2,24],40:[2,24]},{5:[2,16],7:70,8:[1,48],10:[2,16],20:[2,16],22:[2,16],41:[2,16],45:[2,16],58:[2,16]},{17:[2,38],25:[2,38],27:[2,38],30:[2,38],39:[2,38],40:[2,38]},{29:71,36:[1,45]},{29:72,36:[1,45]},{27:[1,58],30:[1,59],33:[1,73],34:74},{27:[2,33],30:[2,33],33:[2,33]},{35:[1,75]},{35:[1,76]},{5:[2,22],10:[2,22],20:[2,22],22:[2,22],41:[2,22],45:[2,22],58:[2,22]},{42:77,57:[1,34]},{42:78,57:[1,34]},{5:[2,46],10:[2,46],20:[2,46],22:[2,46],41:[2,46],45:[2,46],48:[1,79],58:[2,46]},{29:39,36:[1,45],49:80,50:38,51:[1,40],52:[1,41],53:[1,42],54:[1,43],56:44,57:[1,46]},{56:81,57:[1,46]},{6:83,10:[1,82],11:4,12:5,13:6,14:7,15:8,16:9,20:[1,14],21:10,22:[1,15],41:[1,11],45:[1,13],58:[1,12]},{10:[2,6],20:[2,6],22:[2,6],41:[2,6],45:[2,6],58:[2,6]},{5:[2,15],10:[2,15],20:[2,15],22:[2,15],41:[2,15],45:[2,15],58:[2,15]},{5:[2,17],7:84,8:[1,48],10:[2,17],20:[2,17],22:[2,17],41:[2,17],45:[2,17],58:[2,17]},{5:[2,18],10:[2,18],20:[2,18],22:[2,18],41:[2,18],45:[2,18],58:[2,18]},{17:[2,29],25:[2,29],27:[2,29],30:[2,29],39:[2,29],40:[2,29]},{17:[2,30],25:[2,30],27:[2,30],30:[2,30],39:[2,30],40:[2,30]},{17:[2,31],25:[2,31],27:[2,31],30:[2,31],39:[2,31],40:[2,31]},{27:[2,32],30:[2,32],33:[2,32]},{36:[1,85]},{36:[1,86]},{44:[1,87]},{37:[1,89],43:[1,88]},{5:[2,47],10:[2,47],20:[2,47],22:[2,47],41:[2,47],45:[2,47],58:[2,47]},{37:[2,48],46:[2,48]},{37:[2,56],46:[2,56],55:[2,56]},{5:[2,4],10:[2,4],20:[2,4],22:[2,4],41:[2,4],45:[2,4],58:[2,4]},{10:[2,5],20:[2,5],22:[2,5],41:[2,5],45:[2,5],58:[2,5]},{5:[2,19],10:[2,19],20:[2,19],22:[2,19],41:[2,19],45:[2,19],58:[2,19]},{27:[2,34],30:[2,34],33:[2,34],37:[1,90]},{27:[2,36],30:[2,36],33:[2,36],37:[1,91]},{7:92,8:[1,48]},{42:93,57:[1,34]},{42:94,57:[1,34]},{27:[2,35],30:[2,35],33:[2,35]},{27:[2,37],30:[2,37],33:[2,37]},{5:[2,42],10:[2,42],20:[2,42],22:[2,42],41:[2,42],45:[2,42],58:[2,42]},{44:[1,95]},{43:[1,96]},{7:97,8:[1,48]},{42:98,57:[1,34]},{5:[2,43],10:[2,43],20:[2,43],22:[2,43],41:[2,43],45:[2,43],58:[2,43]},{44:[1,99]},{7:100,8:[1,48]},{5:[2,44],10:[2,44],20:[2,44],22:[2,44],41:[2,44],45:[2,44],58:[2,44]}],
defaultActions: {16:[2,1],23:[2,41]},
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
case 0:this.begin('tag'); return 22;
break;
case 1:this.begin('tag'); return 20;
break;
case 2:return 25;
break;
case 3:return 39
break;
case 4:return 40;
break;
case 5:this.popState(); return 17;
break;
case 6:this.begin('tagattrhash'); return 31;
break;
case 7:return 27;
break;
case 8:yy_.yytext = 'data-' + yy_.yytext.slice(1); return 30;
break;
case 9:return 35;
break;
case 10:return 37;
break;
case 11:/* ignore */ 
break;
case 12:/* ignore */ 
break;
case 13:yy_.yytext = strip(1,2).replace(/\\"/g,'"'); return 36;
break;
case 14:this.popState(); return 33;
break;
case 15:this.begin('expr'); return 41;
break;
case 16:this.begin('expr'); return 'CASE';
break;
case 17:this.begin('expr'); return 'IF';
break;
case 18:return 43;
break;
case 19:return 'ELSE';
break;
case 20:return 57;
break;
case 21:this.popState(); return 44;
break;
case 22:this.begin('fn'); return 45;
break;
case 23:return 48;
break;
case 24:return 57;
break;
case 25:return 46;
break;
case 26:return 37;
break;
case 27:return 55;
break;
case 28:return 51   ;
break;
case 29:return 53     ;
break;
case 30:return 52  ;
break;
case 31:return 54    ;
break;
case 32:return 'BOOL'    ;
break;
case 33:return 'NULL'    ;
break;
case 34:return 36;
break;
case 35:/* ignore */
break;
case 36:return 58;
break;
case 37:return 5;
break;
case 38:
  var tokens = [];
  while (0 < _indent_stack[0]) {
    this.popState();
    tokens.unshift("DEDENT");
    _indent_stack.shift();
  }
  if (tokens.length) return tokens;

break;
case 39:/* eat blank lines */
break;
case 40:
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
case 41:/* ignore all other whitespace */
break;
}
},
rules: [/^(?:(%(area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)))/,/^(?:(%[a-zA-Z][a-zA-Z0-9]*))/,/^(?:(#[a-zA-Z][a-zA-Z0-9\-\.\:_]*))/,/^(?:(\.-?[_a-zA-Z]+[_a-zA-Z0-9\-]*(?=["."\s\n])))/,/^(?:([^ \n"#""."]).+(?=\n))/,/^(?:(?=\n))/,/^(?:\{)/,/^(?:([a-zA-Z][a-zA-Z0-9\-_]*(?=:)))/,/^(?:(\*[a-zA-Z][a-zA-Z0-9\-]*(?=:)))/,/^(?::)/,/^(?:,)/,/^(?:\s)/,/^(?:\n)/,/^(?:(('(\\'|[^"'"])*')|("(\\"|[^'"'])*")))/,/^(?:\})/,/^(?::for\b)/,/^(?::case\b)/,/^(?::if\b)/,/^(?:in\b)/,/^(?::else\b)/,/^(?:@?([a-zA-Z_][a-zA-Z0-9_]{0,254}))/,/^(?:(?=\n))/,/^(?:@[a-zA-Z_]*?[a-zA-Z0-9_]*?\()/,/^(?:\.[a-zA-Z_]*?[a-zA-Z0-9_]*?\()/,/^(?:([a-zA-Z_][a-zA-Z0-9_]{0,254}))/,/^(?:\))/,/^(?:,)/,/^(?:\.)/,/^(?:["+""-"]?(0|[1-9][0-9]*)\.[0-9]+)/,/^(?:["+""-"]?(0|[1-9][0-9]*))/,/^(?:(0|[1-9][0-9]*)\.[0-9]+)/,/^(?:(0|[1-9][0-9]*))/,/^(?:true|false\b)/,/^(?:null\b)/,/^(?:('(\\'|[^"'"])*')|("(\\"|[^'"'])*"))/,/^(?:([\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]))/,/^(?:.+)/,/^(?:$)/,/^(?:\s*$)/,/^(?:[\n\r]+([\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000])*(?![^\n\r]))/,/^(?:[\n\r]([\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000])*)/,/^(?:([\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000])+)/],
conditions: {"fn":{"rules":[23,24,25,26,27,28,29,30,31,32,33,34,35],"inclusive":false},"tag":{"rules":[0,1,2,3,4,5,6,15,16,17,22,37,39,41],"inclusive":true},"tagattrhash":{"rules":[0,1,7,8,9,10,11,12,13,14,15,16,17,22,37,39,41],"inclusive":true},"expr":{"rules":[0,1,15,16,17,18,19,20,21,22,26,27,28,29,30,31,32,33,34,35,37,39,41],"inclusive":true},"INITIAL":{"rules":[0,1,15,16,17,22,36,37,38,39,40,41],"inclusive":true}}
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