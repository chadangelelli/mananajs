%start program

%options flex

%%

program: prog_list EOF %{ 
           console.log("\n\n==>\n", JSON.stringify($1, null, "\t"));
           console.log("\n\n==> %j\n", $1); 
           return $1;
         %}
       ;

prog_list: prog_list stmt { $$ = $1; $$.push($2); }
	       | stmt           { $$ = [$1]; }
         ;

block: INDENT stmt_list DEDENT { $$ = $2; }
     ;

stmt_list: stmt_list stmt { $1.push($2); $$ = $1; }
	       | stmt           { $$ = [$1]; }
         ;

stmt: tag_stmt
    | void_tag_stmt
    | filter_stmt
    | for_stmt
    | alias_stmt
    | if_stmt
    | with_stmt
    ;

tag_stmt: tag END_TAG                 { $$ = new TagNode($1, null, null, null, new Location(@1, @1)); }
        | tag text END_TAG            { $$ = new TagNode($1, null, $2,   null, new Location(@1, @2)); }
        | tag END_TAG block           { $$ = new TagNode($1, null, null, $3,   new Location(@1, @3)); }
        | tag tag_attrs END_TAG       { $$ = new TagNode($1, $2,   null, null, new Location(@1, @2)); }
        | tag tag_attrs text END_TAG  { $$ = new TagNode($1, $2,   $3,   null, new Location(@1, @3)); }
        | tag tag_attrs END_TAG block { $$ = new TagNode($1, $2,   null, $4,   new Location(@1, @4)); }
        ;

tag: TAG { $$ = $1; }
   ;

void_tag_stmt: void_tag END_TAG           { $$ = new TagNode($1, null, null, null, new Location(@1, @1)); }
             | void_tag tag_attrs END_TAG { $$ = new TagNode($1, $2,   null, null, new Location(@1, @2)); }
             ;

void_tag: VOID_TAG { $$ = $1; }
        ;

tag_attrs: tag_attrs tag_attr { $$ = $1; $$.push($2); }
         | tag_attr           { $$ = [$1]; }
         | tag_attr_args      { $$ = $1; }
         ;

tag_attr: TAG_ID                  { $$ = ['id', $1]; }
        | tag_classes             { $$ = ['class', $1.join(" ")]; }
        | TAG_ATTR EQ string      { $$ = ['ATTR', $1, $3]; }
        | TAG_DATA_ATTR EQ string { $$ = ['DATA', $1, $3]; }
        ;

tag_attr_args: LPAREN tag_attr_arg_list RPAREN { $$ = $2; }
             ;

tag_attr_arg_list: tag_attr_arg_list tag_attr_arg { $$ = $1; $$.push($2); }
                 | tag_attr_arg                   { $$ = [$1]; }
                 ;

tag_attr_arg
  : TAG_ATTR EQ STRING            { $$ = [$1, $3]; }
  | TAG_ATTR EQ STRING COMMA      { $$ = [$1, $3]; }
  | TAG_DATA_ATTR EQ STRING       { $$ = [$1, $3]; }
  | TAG_DATA_ATTR EQ STRING COMMA { $$ = [$1, $3]; }
  ;

tag_classes: tag_classes TAG_CLASS { $$ = $1; $$.push($2); }
           | TAG_CLASS             { $$ = [$1]; }
           ;

filter_stmt: FILTER INDENT text DEDENT { $$ = ['FILTER', $1, $3]; }
           ;

text: word_list           { $$ = new TextNode($1, new Location(@1, @1)); }
    ;
word_list: word_list word { $$ = $1; $$.push($2); }
         | word           { $$ = [$1]; }
         ;
word: WORD
    | name
    ;

for_stmt: FOR ID IN path END_EXPR block                   { $$ = ['FOR', $2, $4, $6]; }
        | FOR ID COMMA ID IN path END_EXPR block          { $$ = ['FOR', $2, $4, $6, $8]; }
        | FOR ID COMMA ID COMMA ID IN path END_EXPR block { $$ = ['FOR', $2, $4, $6, $8, $10]; }
        ;

if_stmt: IF path END_EXPR block                     { $$ = ['IF', $2, $4]; }
       | IF path END_EXPR block ELSE END_EXPR block { $$ = ['IF', $2, $4, $7]; }
       ;

alias_stmt: ALIAS ID EQ path END_EXPR { $$ = ['ALIAS', $2, $4]; }
          ;

with_stmt: WITH path AS ID END_EXPR block { $$ = ['WITH', $2, $4, $6]; }
         ;

path: path DOT id    { $$ = $1; $$.push($3); }
    | path DOT meths { $$ = $1; $$.push($3); }
    | id             { $$ = ['NAME', $1]; }
    ;

id: ID                               { $$ = $1; }
  | ID LBRACK INT RBRACK             { $$ = [$1, $3]; }
  | ID LBRACK path RBRACK            { $$ = [$1, $3]; }
  | ID LBRACK INT COLON INT RBRACK   { $$ = [$1, $3, $5]; }
  | ID LBRACK INT COLON path RBRACK  { $$ = [$1, $3, $5]; }
  | ID LBRACK path COLON INT RBRACK  { $$ = [$1, $3, $5]; }
  | ID LBRACK path COLON path RBRACK { $$ = [$1, $3, $5]; }
  ;

meths: meths DOT meth { $$ = $1; $$.push($3); }
     | meth           { $$ = ['METH', $1]; }
     ;

meth: ID LPAREN RPAREN           { $$ = [$1, []]; }
    | ID LPAREN meth_args RPAREN { $$ = [$1, $3]; }
    ;

meth_args: meth_args COMMA meth_arg { $$ = $1; $$.push($3); }
         | meth_arg                 { $$ = [$1]; }
         ;

meth_arg: path
        | INT
        | STRING
        ;

name: START_NAME path RBRACE { $$ = $2; }
    ;

%%

function Location(start, end) {
  this.start = { line: start.first_line, column: start.first_column };
  this.end   = { line: end.last_line, column: end.last_column };
}

/* AST nodes */

function TagNode(tag, attrs, text, block, loc) {
  this.type = "Tag";
  this.tag = tag;
  this.attrs = attrs;
  this.body = text || block;
  this.loc = loc;
}

function TextNode(words, loc) {
  var t = ['TEXT'],
      w = words, 
      i = 0, 
      s = '';
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

  this.type = "Text";
  this.body = words;
  this.loc = loc;
}

/* expose AST constructors to parser */

parser.ast = {};
parser.ast.TextNode = TextNode;
parser.ast.TagNode = TagNode;
