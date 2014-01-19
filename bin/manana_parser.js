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
symbols_: {"error":2,"program":3,"prog_list":4,"EOF":5,"stmt":6,"block":7,"INDENT":8,"stmt_list":9,"DEDENT":10,"tag_stmt":11,"void_tag_stmt":12,"filter_stmt":13,"for_stmt":14,"alias_stmt":15,"if_stmt":16,"tag":17,"END_TAG":18,"text":19,"tag_attrs":20,"TAG":21,"void_tag":22,"VOID_TAG":23,"tag_attr":24,"tag_attr_args":25,"TAG_ID":26,"tag_classes":27,"TAG_ATTR":28,"EQ":29,"string":30,"TAG_DATA_ATTR":31,"LPAREN":32,"tag_attr_arg_list":33,"RPAREN":34,"tag_attr_arg":35,"STRING":36,"COMMA":37,"TAG_CLASS":38,"FILTER":39,"word_list":40,"word":41,"WORD":42,"name":43,"FOR":44,"ID":45,"IN":46,"path":47,"END_EXPR":48,"IF":49,"ALIAS":50,"DOT":51,"id":52,"meths":53,"LBRACK":54,"INT":55,"RBRACK":56,"COLON":57,"meth":58,"meth_args":59,"meth_arg":60,"LBRACE":61,"RBRACE":62,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",8:"INDENT",10:"DEDENT",18:"END_TAG",21:"TAG",23:"VOID_TAG",26:"TAG_ID",28:"TAG_ATTR",29:"EQ",30:"string",31:"TAG_DATA_ATTR",32:"LPAREN",34:"RPAREN",36:"STRING",37:"COMMA",38:"TAG_CLASS",39:"FILTER",42:"WORD",44:"FOR",45:"ID",46:"IN",48:"END_EXPR",49:"IF",50:"ALIAS",51:"DOT",54:"LBRACK",55:"INT",56:"RBRACK",57:"COLON",61:"LBRACE",62:"RBRACE"},
productions_: [0,[3,2],[4,2],[4,1],[7,3],[9,2],[9,1],[6,1],[6,1],[6,1],[6,1],[6,1],[6,1],[11,2],[11,3],[11,3],[11,3],[11,4],[11,4],[17,1],[12,2],[12,3],[22,1],[20,2],[20,1],[20,1],[24,1],[24,1],[24,3],[24,3],[25,3],[33,2],[33,1],[35,3],[35,4],[35,3],[35,4],[27,2],[27,1],[13,4],[19,1],[40,2],[40,1],[41,1],[41,1],[14,6],[14,8],[14,10],[16,4],[15,5],[47,3],[47,3],[47,1],[52,1],[52,4],[52,4],[52,6],[52,6],[52,6],[52,6],[53,3],[53,1],[58,3],[58,4],[59,3],[59,1],[60,1],[60,1],[43,3]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1: 
      console.log("\n\n==>\n", JSON.stringify($$[$0-1], null, "\t"));
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
case 13: this.$ = $$[$0-1]; 
break;
case 14: this.$ = $$[$0-2]; this.$.push($$[$0-1]); 
break;
case 15: this.$ = $$[$0-2]; this.$.push($$[$0]); 
break;
case 16: this.$ = $$[$0-2]; this.$[1].push.apply(this.$[1], $$[$0-1]); 
break;
case 17: this.$ = $$[$0-3]; this.$[1].push.apply(this.$[1], $$[$0-2]); this.$.push($$[$0-1]); 
break;
case 18: this.$ = $$[$0-3]; this.$[1].push.apply(this.$[1], $$[$0-2]); this.$.push($$[$0]); 
break;
case 19: this.$ = ['TAG', [$$[$0]]]; 
break;
case 20: this.$ = $$[$0-1]; 
break;
case 21: this.$ = $$[$0-2]; this.$[1].push.apply(this.$[1], $$[$0-1]); 
break;
case 22: this.$ = ['VOID_TAG', $$[$0]]; 
break;
case 23: this.$ = $$[$0-1]; this.$.push($$[$0]); 
break;
case 24: this.$ = [$$[$0]]; 
break;
case 25: this.$ = $$[$0]; 
break;
case 26: this.$ = ['id', $$[$0]]; 
break;
case 27: this.$ = ['class', $$[$0].join(" ")]; 
break;
case 28: this.$ = ['ATTR', $$[$0-2], $$[$0]]; 
break;
case 29: this.$ = ['DATA', $$[$0-2], $$[$0]]; 
break;
case 30: this.$ = $$[$0-1]; 
break;
case 31: this.$ = $$[$0-1]; this.$.push($$[$0]); 
break;
case 32: this.$ = [$$[$0]]; 
break;
case 33: this.$ = [$$[$0-2], $$[$0]]; 
break;
case 34: this.$ = [$$[$0-3], $$[$0-1]]; 
break;
case 35: this.$ = [$$[$0-2], $$[$0]]; 
break;
case 36: this.$ = [$$[$0-3], $$[$0-1]]; 
break;
case 37: this.$ = $$[$0-1]; this.$.push($$[$0]); 
break;
case 38: this.$ = [$$[$0]]; 
break;
case 39: this.$ = ['FILTER', $$[$0-3], $$[$0-1]]; 
break;
case 40:
      var t = ['TEXT'], w = $$[$0], i = 0, s = '';
      while (w[i]) {
        if (typeof w[i] === "string") {
          s += w[i] + ' ';
        } else {
          t.push(s.substring(0, s.length-1));
          t.push(w[i]);
          s = '';
        }
        i++;
      }
      if (s) {
        t.push(s.substring(0, s.length-1));
      }
      this.$ = t;
    
break;
case 41: this.$ = $$[$0-1]; this.$.push($$[$0]); 
break;
case 42: this.$ = [$$[$0]]; 
break;
case 45: this.$ = ['FOR', $$[$0-4], $$[$0-2], $$[$0]]; 
break;
case 46: this.$ = ['FOR', $$[$0-6], $$[$0-4], $$[$0-2], $$[$0]]; 
break;
case 47: this.$ = ['FOR', $$[$0-8], $$[$0-6], $$[$0-4], $$[$0-2], $$[$0]]; 
break;
case 48: this.$ = ['IF', $$[$0-2], $$[$0]]; 
break;
case 49: this.$ = ['ALIAS', $$[$0-3], $$[$0-1]]; 
break;
case 50: this.$ = $$[$0-2]; this.$.push($$[$0]); 
break;
case 51: this.$ = $$[$0-2]; this.$.push($$[$0]); 
break;
case 52: this.$ = ['NAME', $$[$0]]; 
break;
case 53: this.$ = $$[$0]; 
break;
case 54: this.$ = [$$[$0-3], $$[$0-1]]; 
break;
case 55: this.$ = [$$[$0-3], $$[$0-1]]; 
break;
case 56: this.$ = [$$[$0-5], $$[$0-3], $$[$0-1]]; 
break;
case 57: this.$ = [$$[$0-5], $$[$0-3], $$[$0-1]]; 
break;
case 58: this.$ = [$$[$0-5], $$[$0-3], $$[$0-1]]; 
break;
case 59: this.$ = [$$[$0-5], $$[$0-3], $$[$0-1]]; 
break;
case 60: this.$ = $$[$0-2]; this.$.push($$[$0]); 
break;
case 61: this.$ = ['METH', $$[$0]]; 
break;
case 62: this.$ = [$$[$0-2], []]; 
break;
case 63: this.$ = [$$[$0-3], $$[$0-1]]; 
break;
case 64: this.$ = $$[$0-2]; this.$.push($$[$0]); 
break;
case 65: this.$ = [$$[$0]]; 
break;
case 68: this.$ = $$[$0-1]; 
break;
}
},
table: [{3:1,4:2,6:3,11:4,12:5,13:6,14:7,15:8,16:9,17:10,21:[1,16],22:11,23:[1,17],39:[1,12],44:[1,13],49:[1,15],50:[1,14]},{1:[3]},{5:[1,18],6:19,11:4,12:5,13:6,14:7,15:8,16:9,17:10,21:[1,16],22:11,23:[1,17],39:[1,12],44:[1,13],49:[1,15],50:[1,14]},{5:[2,3],21:[2,3],23:[2,3],39:[2,3],44:[2,3],49:[2,3],50:[2,3]},{5:[2,7],10:[2,7],21:[2,7],23:[2,7],39:[2,7],44:[2,7],49:[2,7],50:[2,7]},{5:[2,8],10:[2,8],21:[2,8],23:[2,8],39:[2,8],44:[2,8],49:[2,8],50:[2,8]},{5:[2,9],10:[2,9],21:[2,9],23:[2,9],39:[2,9],44:[2,9],49:[2,9],50:[2,9]},{5:[2,10],10:[2,10],21:[2,10],23:[2,10],39:[2,10],44:[2,10],49:[2,10],50:[2,10]},{5:[2,11],10:[2,11],21:[2,11],23:[2,11],39:[2,11],44:[2,11],49:[2,11],50:[2,11]},{5:[2,12],10:[2,12],21:[2,12],23:[2,12],39:[2,12],44:[2,12],49:[2,12],50:[2,12]},{18:[1,20],19:21,20:22,24:24,25:25,26:[1,27],27:28,28:[1,29],31:[1,30],32:[1,31],38:[1,34],40:23,41:26,42:[1,32],43:33,61:[1,35]},{18:[1,36],20:37,24:24,25:25,26:[1,27],27:28,28:[1,29],31:[1,30],32:[1,31],38:[1,34]},{8:[1,38]},{45:[1,39]},{45:[1,40]},{45:[1,43],47:41,52:42},{18:[2,19],26:[2,19],28:[2,19],31:[2,19],32:[2,19],38:[2,19],42:[2,19],61:[2,19]},{18:[2,22],26:[2,22],28:[2,22],31:[2,22],32:[2,22],38:[2,22]},{1:[2,1]},{5:[2,2],21:[2,2],23:[2,2],39:[2,2],44:[2,2],49:[2,2],50:[2,2]},{5:[2,13],7:44,8:[1,45],10:[2,13],21:[2,13],23:[2,13],39:[2,13],44:[2,13],49:[2,13],50:[2,13]},{18:[1,46]},{18:[1,47],19:48,24:49,26:[1,27],27:28,28:[1,29],31:[1,30],38:[1,34],40:23,41:26,42:[1,32],43:33,61:[1,35]},{10:[2,40],18:[2,40],41:50,42:[1,32],43:33,61:[1,35]},{18:[2,24],26:[2,24],28:[2,24],31:[2,24],38:[2,24],42:[2,24],61:[2,24]},{18:[2,25],26:[2,25],28:[2,25],31:[2,25],38:[2,25],42:[2,25],61:[2,25]},{10:[2,42],18:[2,42],42:[2,42],61:[2,42]},{18:[2,26],26:[2,26],28:[2,26],31:[2,26],38:[2,26],42:[2,26],61:[2,26]},{18:[2,27],26:[2,27],28:[2,27],31:[2,27],38:[1,51],42:[2,27],61:[2,27]},{29:[1,52]},{29:[1,53]},{28:[1,56],31:[1,57],33:54,35:55},{10:[2,43],18:[2,43],42:[2,43],61:[2,43]},{10:[2,44],18:[2,44],42:[2,44],61:[2,44]},{18:[2,38],26:[2,38],28:[2,38],31:[2,38],38:[2,38],42:[2,38],61:[2,38]},{45:[1,43],47:58,52:42},{5:[2,20],10:[2,20],21:[2,20],23:[2,20],39:[2,20],44:[2,20],49:[2,20],50:[2,20]},{18:[1,59],24:49,26:[1,27],27:28,28:[1,29],31:[1,30],38:[1,34]},{19:60,40:23,41:26,42:[1,32],43:33,61:[1,35]},{37:[1,62],46:[1,61]},{29:[1,63]},{48:[1,64],51:[1,65]},{34:[2,52],37:[2,52],48:[2,52],51:[2,52],56:[2,52],57:[2,52],62:[2,52]},{34:[2,53],37:[2,53],48:[2,53],51:[2,53],54:[1,66],56:[2,53],57:[2,53],62:[2,53]},{5:[2,15],10:[2,15],21:[2,15],23:[2,15],39:[2,15],44:[2,15],49:[2,15],50:[2,15]},{6:68,9:67,11:4,12:5,13:6,14:7,15:8,16:9,17:10,21:[1,16],22:11,23:[1,17],39:[1,12],44:[1,13],49:[1,15],50:[1,14]},{5:[2,14],10:[2,14],21:[2,14],23:[2,14],39:[2,14],44:[2,14],49:[2,14],50:[2,14]},{5:[2,16],7:69,8:[1,45],10:[2,16],21:[2,16],23:[2,16],39:[2,16],44:[2,16],49:[2,16],50:[2,16]},{18:[1,70]},{18:[2,23],26:[2,23],28:[2,23],31:[2,23],38:[2,23],42:[2,23],61:[2,23]},{10:[2,41],18:[2,41],42:[2,41],61:[2,41]},{18:[2,37],26:[2,37],28:[2,37],31:[2,37],38:[2,37],42:[2,37],61:[2,37]},{30:[1,71]},{30:[1,72]},{28:[1,56],31:[1,57],34:[1,73],35:74},{28:[2,32],31:[2,32],34:[2,32]},{29:[1,75]},{29:[1,76]},{51:[1,65],62:[1,77]},{5:[2,21],10:[2,21],21:[2,21],23:[2,21],39:[2,21],44:[2,21],49:[2,21],50:[2,21]},{10:[1,78]},{45:[1,43],47:79,52:42},{45:[1,80]},{45:[1,43],47:81,52:42},{7:82,8:[1,45]},{45:[1,85],52:83,53:84,58:86},{45:[1,43],47:88,52:42,55:[1,87]},{6:90,10:[1,89],11:4,12:5,13:6,14:7,15:8,16:9,17:10,21:[1,16],22:11,23:[1,17],39:[1,12],44:[1,13],49:[1,15],50:[1,14]},{10:[2,6],21:[2,6],23:[2,6],39:[2,6],44:[2,6],49:[2,6],50:[2,6]},{5:[2,18],10:[2,18],21:[2,18],23:[2,18],39:[2,18],44:[2,18],49:[2,18],50:[2,18]},{5:[2,17],10:[2,17],21:[2,17],23:[2,17],39:[2,17],44:[2,17],49:[2,17],50:[2,17]},{18:[2,28],26:[2,28],28:[2,28],31:[2,28],38:[2,28],42:[2,28],61:[2,28]},{18:[2,29],26:[2,29],28:[2,29],31:[2,29],38:[2,29],42:[2,29],61:[2,29]},{18:[2,30],26:[2,30],28:[2,30],31:[2,30],38:[2,30],42:[2,30],61:[2,30]},{28:[2,31],31:[2,31],34:[2,31]},{36:[1,91]},{36:[1,92]},{10:[2,68],18:[2,68],42:[2,68],61:[2,68]},{5:[2,39],10:[2,39],21:[2,39],23:[2,39],39:[2,39],44:[2,39],49:[2,39],50:[2,39]},{48:[1,93],51:[1,65]},{37:[1,95],46:[1,94]},{48:[1,96],51:[1,65]},{5:[2,48],10:[2,48],21:[2,48],23:[2,48],39:[2,48],44:[2,48],49:[2,48],50:[2,48]},{34:[2,50],37:[2,50],48:[2,50],51:[2,50],56:[2,50],57:[2,50],62:[2,50]},{34:[2,51],37:[2,51],48:[2,51],51:[1,97],56:[2,51],57:[2,51],62:[2,51]},{32:[1,98],34:[2,53],37:[2,53],48:[2,53],51:[2,53],54:[1,66],56:[2,53],57:[2,53],62:[2,53]},{34:[2,61],37:[2,61],48:[2,61],51:[2,61],56:[2,61],57:[2,61],62:[2,61]},{56:[1,99],57:[1,100]},{51:[1,65],56:[1,101],57:[1,102]},{5:[2,4],10:[2,4],21:[2,4],23:[2,4],39:[2,4],44:[2,4],49:[2,4],50:[2,4]},{10:[2,5],21:[2,5],23:[2,5],39:[2,5],44:[2,5],49:[2,5],50:[2,5]},{28:[2,33],31:[2,33],34:[2,33],37:[1,103]},{28:[2,35],31:[2,35],34:[2,35],37:[1,104]},{7:105,8:[1,45]},{45:[1,43],47:106,52:42},{45:[1,107]},{5:[2,49],10:[2,49],21:[2,49],23:[2,49],39:[2,49],44:[2,49],49:[2,49],50:[2,49]},{45:[1,109],58:108},{34:[1,110],45:[1,43],47:113,52:42,55:[1,114],59:111,60:112},{34:[2,54],37:[2,54],48:[2,54],51:[2,54],56:[2,54],57:[2,54],62:[2,54]},{45:[1,43],47:116,52:42,55:[1,115]},{34:[2,55],37:[2,55],48:[2,55],51:[2,55],56:[2,55],57:[2,55],62:[2,55]},{45:[1,43],47:118,52:42,55:[1,117]},{28:[2,34],31:[2,34],34:[2,34]},{28:[2,36],31:[2,36],34:[2,36]},{5:[2,45],10:[2,45],21:[2,45],23:[2,45],39:[2,45],44:[2,45],49:[2,45],50:[2,45]},{48:[1,119],51:[1,65]},{46:[1,120]},{34:[2,60],37:[2,60],48:[2,60],51:[2,60],56:[2,60],57:[2,60],62:[2,60]},{32:[1,98]},{34:[2,62],37:[2,62],48:[2,62],51:[2,62],56:[2,62],57:[2,62],62:[2,62]},{34:[1,121],37:[1,122]},{34:[2,65],37:[2,65]},{34:[2,66],37:[2,66],51:[1,65]},{34:[2,67],37:[2,67]},{56:[1,123]},{51:[1,65],56:[1,124]},{56:[1,125]},{51:[1,65],56:[1,126]},{7:127,8:[1,45]},{45:[1,43],47:128,52:42},{34:[2,63],37:[2,63],48:[2,63],51:[2,63],56:[2,63],57:[2,63],62:[2,63]},{45:[1,43],47:113,52:42,55:[1,114],60:129},{34:[2,56],37:[2,56],48:[2,56],51:[2,56],56:[2,56],57:[2,56],62:[2,56]},{34:[2,57],37:[2,57],48:[2,57],51:[2,57],56:[2,57],57:[2,57],62:[2,57]},{34:[2,58],37:[2,58],48:[2,58],51:[2,58],56:[2,58],57:[2,58],62:[2,58]},{34:[2,59],37:[2,59],48:[2,59],51:[2,59],56:[2,59],57:[2,59],62:[2,59]},{5:[2,46],10:[2,46],21:[2,46],23:[2,46],39:[2,46],44:[2,46],49:[2,46],50:[2,46]},{48:[1,130],51:[1,65]},{34:[2,64],37:[2,64]},{7:131,8:[1,45]},{5:[2,47],10:[2,47],21:[2,47],23:[2,47],39:[2,47],44:[2,47],49:[2,47],50:[2,47]}],
defaultActions: {18:[2,1]},
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
case 4:this.pushState("tag"); return "VOID_TAG";
break;
case 5:this.pushState("tag"); return "TAG";
break;
case 6:this.popState(); return "END_TAG";
break;
case 7:yy_.yytext = yy_.yytext.slice(1); return "TAG_ID";
break;
case 8:yy_.yytext = yy_.yytext.slice(1); return "TAG_CLASS";
break;
case 9:this.pushState("tagargs"); return "LPAREN";
break;
case 10:this.popState(); return "RPAREN";
break;
case 11:/* ignore */
break;
case 12:/* ignore */
break;
case 13:return "EQ";
break;
case 14:return "COMMA";
break;
case 15:return "TAG_ATTR";
break;
case 16:yy_.yytext = "data-" + yy_.yytext.slice(1); return "TAG_DATA_ATTR";
break;
case 17:yy_.yytext = strip(1,2).replace(/\\"/g, '"'); return "STRING";
break;
case 18:this.pushState("filter"); yy_.yytext = yy_.yytext.slice(1); return "FILTER";
break;
case 19:this.pushState("expr"); return "FOR";
break;
case 20:this.pushState("expr"); return "IF";
break;
case 21:this.pushState("expr"); return "ELSE";
break;
case 22:this.pushState("expr"); return "ALIAS";
break;
case 23:this.popState(); return "END_EXPR";
break;
case 24:return "IN";
break;
case 25:return "EQ";
break;
case 26:this.pushState("name"); return "LBRACE";
break;
case 27:this.popState(); return "RBRACE"
break;
case 28:return "ID";
break;
case 29:return "DOT";
break;
case 30:return "LPAREN";
break;
case 31:return "RPAREN";
break;
case 32:return "LBRACK";
break;
case 33:return "RBRACK";
break;
case 34:return "COLON"; 
break;
case 35:return "COMMA";
break;
case 36:return "INT";
break;
case 37:return "WORD";
break;
case 38:return 5;
break;
case 39:
  var tokens = [];
  while (0 < _indent_stack[0]) {
    this.popState();
    tokens.unshift("DEDENT");
    _indent_stack.shift();
  }
  if (tokens.length) return tokens;

break;
case 40:/* eat blank lines */
break;
case 41:
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
case 42:/* ignore all other whitespace */
break;
}
},
rules: [/^(?:""")/,/^(?:""")/,/^(?:.+)/,/^(?:\n)/,/^(?:((area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)))/,/^(?:(\$?[a-zA-Z_][a-zA-Z0-9_]{0,254}))/,/^(?:(?=\n))/,/^(?:(#[a-zA-Z][a-zA-Z0-9\-\:_]*))/,/^(?:(\.-?[_a-zA-Z]+[_a-zA-Z0-9\-]*(?=["."\s\n])))/,/^(?:\()/,/^(?:\))/,/^(?:\s)/,/^(?:\n)/,/^(?:=)/,/^(?:,)/,/^(?:([a-zA-Z][a-zA-Z0-9\-_]*(?==)))/,/^(?:(\*[a-zA-Z][a-zA-Z0-9\-]*(?==)))/,/^(?:(('(\\'|[^"'"])*')|("(\\"|[^'"'])*")))/,/^(?::(\$?[a-zA-Z_][a-zA-Z0-9_]{0,254}))/,/^(?:%for\b)/,/^(?:%if\b)/,/^(?:%else\b)/,/^(?:%alias\b)/,/^(?:(?=\n))/,/^(?:in\b)/,/^(?:=)/,/^(?:@\{)/,/^(?:\})/,/^(?:(\$?[a-zA-Z_][a-zA-Z0-9_]{0,254}))/,/^(?:\.)/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?::)/,/^(?:,)/,/^(?:(\+|-)?(0|[1-9][0-9]*))/,/^(?:((?!\$\{)[^\s\n][^\s\n]*))/,/^(?:$)/,/^(?:\s*$)/,/^(?:[\n\r]+([\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000])*(?![^\n\r]))/,/^(?:[\n\r]([\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000])*)/,/^(?:([\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000])+)/],
conditions: {"comment":{"rules":[1,2,3,38,40,42],"inclusive":true},"tag":{"rules":[6,7,8,9,26,37,38,40,42],"inclusive":true},"tagargs":{"rules":[10,11,12,13,14,15,16,17,38,40,42],"inclusive":true},"filter":{"rules":[37,38,39,40,41,42],"inclusive":true},"expr":{"rules":[23,24,25,28,29,30,31,32,33,34,35,36,38,40,42],"inclusive":true},"name":{"rules":[27,28,29,30,31,32,33,34,35,36,38,40,42],"inclusive":true},"INITIAL":{"rules":[0,4,5,18,19,20,21,22,26,37,38,39,40,41,42],"inclusive":true}}
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