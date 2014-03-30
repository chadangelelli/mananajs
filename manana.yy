%start program 
%options flex
%%

program: prog_list EOF { console.log(JSON.stringify($1, null, 4)); return $1; }
       ;

prog_list: prog_list stmt { $$ = $1; $$.push($2); }
	       | stmt           { $$ = [$1]; }
         | block          { $$ = $1; }
         ;

block: INDENT stmt_list DEDENT { $$ = $2; }
     ;

stmt_list: stmt_list stmt { $1.push($2); $$ = $1; }
	       | stmt           { $$ = [$1]; }
         ;

stmt: void_tag_stmt
    | tag_stmt
    | filter_stmt
    | alias_stmt
    | with_stmt
    | if_stmt
    | for_stmt
    ;

void_tag_stmt: void_tag END_TAG           { $$ = new VoidTagNode($1, null, new Location(@1, @1)); }
             | void_tag tag_attrs END_TAG { $$ = new VoidTagNode($1, $2,   new Location(@1, @2)); }
             ;
void_tag: VOID_TAG { $$ = $1; }
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

filter_stmt: FILTER FILTER_START text FILTER_END { $$ = new FilterNode($1, $3, new Location(@1, @3)); }
           ;

text: word_list { $$ = new TextNode($1, new Location(@1, @1)); }
    ;

word_list: word           { $$ = [$1]; }
         | word_list word { $$ = $1; $$.push($2); }
         ;

word: WORD
    | name
    | SPACE
    ;

with_stmt: WITH path AS ID END_EXPR block { $$ = new WithNode($2, $4, $6, new Location(@1, @6)); } 
         ;

for_stmt: FOR ID IN path END_EXPR block { $$ = new ForNode($2, $4, $6 , new Location(@1, @6)) ; }
        ;

if_stmt: IF path END_EXPR block                     { $$ = new IfNode($2, $4, null, new Location(@1, @4)); }
       | IF path END_EXPR block ELSE END_EXPR block { $$ = new IfNode($2, $4, $7  , new Location(@1, @7)); }
       ;

alias_stmt: ALIAS ID EQ path END_EXPR { $$ = new AliasNode($2, $4, new Location(@1, @5)); }
          ;

path: id             { $$ = new PathNode($1, new Location(@1, @1)); }
    | path DOT id    { $$ = updatePathNode($1, $3, null, new Location(@1, @3));  }
    | path DOT meths { $$ = updatePathNode($1, null, $3, new Location(@1, @3)); }
    ;

id: ID                               { $$ = new IdNode($1, null, null, new Location(@1, @1)); }
  | ID LBRACK INT RBRACK             { $$ = new IdNode($1, $3  , null, new Location(@1, @4)); }
  | ID LBRACK INT COLON INT  RBRACK  { $$ = new IdNode($1, $3  , $5  , new Location(@1, @6)); }
  | ID LBRACK INT COLON path RBRACK  { $$ = new IdNode($1, $3  , $5  , new Location(@1, @6)); }
  | ID LBRACK path RBRACK            { $$ = new IdNode($1, $3  , null, new Location(@1, @4)); }
  | ID LBRACK path COLON INT  RBRACK { $$ = new IdNode($1, $3  , $5  , new Location(@1, @6)); }
  | ID LBRACK path COLON path RBRACK { $$ = new IdNode($1, $3  , $5  , new Location(@1, @6)); }
  | ID LBRACK COLON INT RBRACK       { $$ = new IdNode($1, 0   , $4  , new Location(@1, @5)); }
  | ID LBRACK INT COLON RBRACK       { $$ = new IdNode($1, $3  , '*' , new Location(@1, @5)); }
  ;

meths: meth           { $$ = new MethodChainNode($1, new Location(@1, @1)); }
     | meths DOT meth { $$ = $1; $$.chain.push($3)                        ; }
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

function VoidTagNode(tag, attrs, loc) {
  this.type = "VoidTag";
  this.tag = tag;
  this.attrs = attrs;
  this.loc = loc;
}

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

  var w = words, t = [], s = [], i = 0; 

  while (typeof w[i] !== "undefined") {
    if (typeof w[i] === "string") {
      s.push(w[i]);
    } else {
      if (s.length) {
        t.push(s.join(' '));
        s = [];
      }
      t.push(w[i]);
    }
    i++;
  }
  if (s.length) {
    t.push(s.join(' '));
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
  this.components = [ createPathComponent(component) ];
  this.methods = [];
  this.loc = loc;
}

function createPathComponent(c) {
  var comp = [c.id];
  if (c.start !== null) comp.push(c.start);
  if (c.end !== null) comp.push(c.end);
  return comp;
}

function updatePathNode(node, component, methods, loc) {
  if (component !== null) {
    node.components.push(createPathComponent(component));
  }
  if (methods !== null) {
    node.methods = methods;
  }
  if (loc.end.line > node.loc.end.line || loc.end.column > node.loc.end.column) {
    node.loc.end = loc.end;
  }
  return node;
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

function ForNode(id, path, body, loc) {
  this.type = "For";
  this.id = id;
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

function FilterNode(filter, body, loc) {
  this.type = "Filter";
  this.body = body;
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
parser.ast.createPathComponent = createPathComponent;
parser.ast.updatePathNode = updatePathNode;
parser.ast.MethodNode = MethodNode;
parser.ast.MethodChainNode = MethodChainNode;
parser.ast.ForNode = ForNode;
parser.ast.IfNode = IfNode;
parser.ast.AliasNode = AliasNode;
parser.ast.FilterNode = FilterNode;
