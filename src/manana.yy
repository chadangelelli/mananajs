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
        | TAG_ATTR EQ string      { $$ = ['attr', $1, $3]; }
        | TAG_DATA_ATTR EQ string { $$ = ['data', $1, $3]; }
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

with_stmt: WITH path AS ID END_EXPR block { $$ = new WithNode($2, $4, $6, new Location(@1, @6)); } 
         ;

for_stmt: FOR ID IN path END_EXPR block                   { $$ = new ForNode(null, null, $2, $4, $6 , new Location(@1, @6)) ; }
        | FOR ID COMMA ID IN path END_EXPR block          { $$ = new ForNode(null, $2  , $4, $6, $8 , new Location(@1, @8)) ; }
        | FOR ID COMMA ID COMMA ID IN path END_EXPR block { $$ = new ForNode($2  , $4  , $6, $8, $10, new Location(@1, @10)); }
        ;

if_stmt: IF path END_EXPR block                     { $$ = new IfNode($2, $4, null, new Location(@1, @4)); }
       | IF path END_EXPR block ELSE END_EXPR block { $$ = new IfNode($2, $4, $7  , new Location(@1, @7)); }
       ;

alias_stmt: ALIAS ID EQ path END_EXPR { $$ = new AliasNode($2, $4, new Location(@1, @5)); }
          ;

path: path DOT id    { $$ = $1; $$.components.push($3); }
    | path DOT meths { $$ = $1; $$.methods = $3; }
    | id             { $$ = new PathNode($1, new Location(@1, @1)); }
    ;

id: ID                               { $$ = new IdNode($1, null, null, new Location(@1, @1)); }
  | ID LBRACK INT  RBRACK            { $$ = new IdNode($1, $3  , null, new Location(@1, @4)); }
  | ID LBRACK INT  COLON INT  RBRACK { $$ = new IdNode($1, $3  , $5  , new Location(@1, @6)); }
  | ID LBRACK INT  COLON path RBRACK { $$ = new IdNode($1, $3  , $5  , new Location(@1, @6)); }
  | ID LBRACK path RBRACK            { $$ = new IdNode($1, $3  , null, new Location(@1, @4)); }
  | ID LBRACK path COLON INT  RBRACK { $$ = new IdNode($1, $3  , $5  , new Location(@1, @6)); }
  | ID LBRACK path COLON path RBRACK { $$ = new IdNode($1, $3  , $5  , new Location(@1, @6)); }
  ;

meths: meths DOT meth { $$ = $1; $$.chain.push($3); }
     | meth           { $$ = new MethodChainNode($1, new Location(@1, @1)); }
     ;

meth: ID LPAREN RPAREN           { $$ = new MethodNode($1, null, new Location(@1, @3)); }
    | ID LPAREN meth_args RPAREN { $$ = new MethodNode($1, $3  , new Location(@1, @4)); }
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
  this.end = { line: end.last_line, column: end.last_column };
}

/* AST nodes */

function TagNode(tag, attrs, text, block, loc) {
  this.type = "Tag";
  this.tag = tag;
  this.attrs = attrs;
  this.body = text ? [text] : block;
  this.loc = loc;
}

function TextNode(words, loc) {
  this.type = "Text";
  this.loc = loc;

  var t = [],
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
  this.body = t;
}

function NameNode(path, loc) {
  this.type = "Name";
  this.body = path;
  this.loc = loc;
}

function WithNode(path, id, body, loc) {
  this.type = "With";
  this.path = path;
  this.id = id;
  this.body = body;
  this.loc = loc;
}

function IdNode(id, start, end, loc) {
  this.type = "Id";
  this.id = id;
  this.start = start;
  this.end = end;
  this.loc = loc;
}

function PathNode(component, loc) {
  this.type = "Path";
  this.components = [component];
  this.methods = [];
  this.loc = loc;
}

function MethodNode(name, args, loc) {
  this.type = "Method";
  this.name = name;
  this.args = args;
  this.loc = loc;
}

function MethodChainNode(method, loc) {
  this.type = "MethodChain";
  this.chain = [method];
  this.loc = loc;
}

function ForNode(index, offset, value, path, body, loc) {
  this.type = "For";
  this.index = index;
  this.offset = offset;
  this.value = value;
  this.path = path;
  this.body = body;
  this.loc = loc;
}

function IfNode(path, body, else_body, loc) {
  this.type = "If";
  this.path = path;
  this.body = body;
  this.else_body = else_body;
  this.loc = loc;
}

function AliasNode(id, path, loc) {
  this.type = "Alias";
  this.id = id;
  this.path = path;
  this.loc = loc;
}

/* expose AST constructors to parser */

parser.ast = {};
parser.ast.Location = Location;
parser.ast.TagNode = TagNode;
parser.ast.TextNode = TextNode;
parser.ast.NameNode = NameNode;
parser.ast.WithNode = WithNode;
parser.ast.IdNode = IdNode;
parser.ast.PathNode = PathNode;
parser.ast.MethodNode = MethodNode;
parser.ast.MethodChainNode = MethodChainNode;
parser.ast.ForNode = ForNode;
parser.ast.IfNode = IfNode;
parser.ast.AliasNode = AliasNode;
