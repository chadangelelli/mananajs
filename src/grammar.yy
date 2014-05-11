%start program 
%options flex
%%

program
  : prog_list EOF { return $1; } 
  ;

prog_list
  : prog_list stmt { $$ = $1; $$.push($2); }
	| stmt           { $$ = [$1]; }
  | block          { $$ = $1; } 
  ;

block
  : INDENT stmt_list DEDENT { $$ = $2; } 
  ;

stmt_list
  : stmt_list stmt { $1.push($2); $$ = $1; }
	| stmt           { $$ = [$1]; } 
  ;

stmt
  : html_stmt
  | void_tag_stmt
  | tag_stmt
  | filter_stmt
  | alias_stmt
  | include_stmt
  | with_stmt
  | if_stmt
  | for_stmt 
  | name
  | fn
  ;

html_stmt
  : HTML { $$ = new HtmlNode($1, new Loc(@1, @1)); }
  ;

void_tag_stmt
  : void_tag END_TAG           { $$ = new VoidTagNode($1, null, new Loc(@1, @1)); }
  | void_tag tag_attrs END_TAG { $$ = new VoidTagNode($1, $2,   new Loc(@1, @2)); } 
  ;
void_tag
  : VOID_TAG { $$ = $1; }
  ;

tag_stmt
  : tag END_TAG                 { $$ = new TagNode($1, null, null, null, new Loc(@1, @1)); }
  | tag text END_TAG            { $$ = new TagNode($1, null, $2,   null, new Loc(@1, @2)); }
  | tag END_TAG block           { $$ = new TagNode($1, null, null, $3,   new Loc(@1, @3)); }
  | tag tag_attrs END_TAG       { $$ = new TagNode($1, $2,   null, null, new Loc(@1, @2)); }
  | tag tag_attrs text END_TAG  { $$ = new TagNode($1, $2,   $3,   null, new Loc(@1, @3)); }
  | tag tag_attrs END_TAG block { $$ = new TagNode($1, $2,   null, $4,   new Loc(@1, @4)); }
  ;
tag
  : TAG { $$ = $1; }
  ;

tag_attrs
  : tag_attrs tag_attr { $$ = $1; $$.push($2); }
  | tag_attr           { $$ = [$1]; }
  | tag_attr_args      { $$ = $1; }
  ;

tag_attr
  : TAG_ID                  { $$ = ['id', $1]; }
  | tag_classes             { $$ = ['class', $1.join(" ")]; }
  | TAG_ATTR EQ STRING      { $$ = ['attr', $1, $3]; }
  | TAG_DATA_ATTR EQ STRING { $$ = ['data', $1, $3]; }
  ;

tag_attr_args
  : LPAREN tag_attr_arg_list RPAREN { $$ = $2; }
  ;

tag_attr_arg_list
  : tag_attr_arg_list tag_attr_arg { $$ = $1; $$.push($2); }
  | tag_attr_arg                   { $$ = [$1]; }
  ;

tag_attr_arg
  : TAG_ATTR EQ STRING            { $$ = [$1, $3]; }
  | TAG_ATTR EQ STRING COMMA      { $$ = [$1, $3]; }
  | TAG_DATA_ATTR EQ STRING       { $$ = [$1, $3]; }
  | TAG_DATA_ATTR EQ STRING COMMA { $$ = [$1, $3]; }
  ;

tag_classes
  : tag_classes TAG_CLASS { $$ = $1; $$.push($2); }
  | TAG_CLASS             { $$ = [$1]; }
  ;

filter_stmt
  : FILTER FILTER_START text DEDENT { $$ = new FilterNode($1, $3, new Loc(@1, @3)); }
  ;

text
  : word_list { $$ = new TextNode($1, new Loc(@1, @1)); }
  ;

word_list
  : word           { $$ = [$1]; }
  | word_list word { $$ = $1; $$.push($2); }
  ;

word
  : WORD
 | name
 | SPACE
 ;

with_stmt
  : WITH path AS ID END_EXPR block { $$ = new WithNode($2, $4, $6, new Loc(@1, @6)); } 
  ;

for_stmt
  : FOR ID IN path END_EXPR block { $$ = new ForNode($2, $4, $6 , new Loc(@1, @6)) ; }
  ;

/* IfNode(cond, v1, v2, body, else_body, loc) */
if_stmt
  : IF ev END_EXPR block 
    { $$ = new IfNode("true", $2, null, $4, null, new Loc(@1, @4)); }

  | IF ev END_EXPR block ELSE END_EXPR block 
    { $$ = new IfNode("true", $2, null, $4, $7, new Loc(@1, @7)); }

  | IF NOT ev END_EXPR block 
    { $$ = new IfNode("false", $3, null, $5, null, new Loc(@1, @5)); }

  | IF NOT ev END_EXPR block ELSE END_EXPR block 
    { $$ = new IfNode("false", $3, null, $5, $8, new Loc(@1, @8)); }

  | IF ev COND ev END_EXPR block
    { $$ = new IfNode($3, $2, $4, $6, null, new Loc(@1, @6)); }

  | IF ev COND ev END_EXPR block ELSE END_EXPR block
    { $$ = new IfNode($3, $2, $4, $6, $9, new Loc(@1, @9)); }

  | IF ev IS TYPE END_EXPR block 
    { $$ = new IfNode($3, $2, $4, $6, null, new Loc(@1, @6)); }

  | IF ev IS TYPE END_EXPR block ELSE END_EXPR block
    { $$ = new IfNode($3, $2, $4, $6, null, new Loc(@1, @9)); }

  | IF ev IS NOT TYPE END_EXPR block 
    { $$ = new IfNode("is not", $2, $5, $7, null, new Loc(@1, @7)); }

  | IF ev IS NOT TYPE END_EXPR block ELSE END_EXPR block
    { $$ = new IfNode("is not", $2, $5, $7, $10, new Loc(@1, @10)); }
  ;

ev
  : STRING
  | INT
  | BOOL
  | path
  ;

alias_stmt
  : ALIAS ID EQ path END_EXPR { $$ = new AliasNode($2, $4, new Loc(@1, @5)); }
  ;

include_stmt
  : INCLUDE STRING END_EXPR { $$ = new IncludeNode($2, new Loc(@1, @2)); }
  ;

path
  : id             { $$ = new PathNode($1, new Loc(@1, @1)); }
  | path DOT id    { $$ = updatePathNode($1, $3, null, new Loc(@1, @3));  }
  | path DOT meths { $$ = updatePathNode($1, null, $3, new Loc(@1, @3)); }
  ;

id
  : ID                               { $$ = new IdNode($1, null, null, new Loc(@1, @1)); }
  | ID LBRACK INT RBRACK             { $$ = new IdNode($1, $3  , null, new Loc(@1, @4)); }
  | ID LBRACK INT COLON INT  RBRACK  { $$ = new IdNode($1, $3  , $5  , new Loc(@1, @6)); }
  | ID LBRACK INT COLON path RBRACK  { $$ = new IdNode($1, $3  , $5  , new Loc(@1, @6)); }
  | ID LBRACK path RBRACK            { $$ = new IdNode($1, $3  , null, new Loc(@1, @4)); }
  | ID LBRACK path COLON INT  RBRACK { $$ = new IdNode($1, $3  , $5  , new Loc(@1, @6)); }
  | ID LBRACK path COLON path RBRACK { $$ = new IdNode($1, $3  , $5  , new Loc(@1, @6)); }
  | ID LBRACK COLON INT RBRACK       { $$ = new IdNode($1, 0   , $4  , new Loc(@1, @5)); }
  | ID LBRACK INT COLON RBRACK       { $$ = new IdNode($1, $3  , '*' , new Loc(@1, @5)); }
  ;

meths
  : meth           { $$ = new MethodChainNode($1, new Loc(@1, @1)); }
  | meths DOT meth { $$ = $1; $$.chain.push($3)                        ; }
  ;

meth
  : ID LPAREN RPAREN           { $$ = new MethodNode($1, null, new Loc(@1, @3)); }
  | ID LPAREN meth_args RPAREN { $$ = new MethodNode($1, $3  , new Loc(@1, @4)); }
  ;

meth_args
  : meth_args COMMA meth_arg { $$ = $1; $$.push($3); }
  | meth_arg                 { $$ = [$1]; }
  ;

meth_arg
  : path
  | INT
  | STRING
  ;

fn
  : FN LPAREN RPAREN         { $$ = new FunctionNode($1, null, new Loc(@1, @3)); }
  | FN LPAREN fn_args RPAREN { $$ = new FunctionNode($1, $3  , new Loc(@1, @4)); }
  ;

fn_args
  : fn_args COMMA fn_arg { $$ = $1; $$.push($3); }
  | fn_arg               { $$ = [$1]; }
  ;

fn_arg
  : path
  | INT
  | STRING
  | fn
  | hash
  ;

hash
  : LBRACE hash_data RBRACE       { $$ = new MananaHash($2); console.log($$); }
  | LBRACE hash_data COMMA RBRACE { $$ = new MananaHash($2); console.log($$); }
  ;

hash_data
  : hash_data COMMA hash_pair { $$ = $1; $$.push($3); }
  | hash_pair                 { $$ = [$1]; }
  ;

hash_pair
  : ID COLON hash_val { $$ = [$1, $3]; }
  ;

hash_val
  : INT
  | BOOL
  | STRING
  | fn
  | hash
  | path
  ;

name
  : START_NAME path RBRACE { $$ = $2; }
  ;

%%

/* tracing/debugging functions */

function Loc(start, end) {
  this.start = { line: start.first_line, column: start.first_column };
  this.end = { line: end.last_line, column: end.last_column };
}

/* Manana data types */

function MananaHash(data, loc) {
  var hash = {}, i = 0;

  while (data[i]) {
    hash[data[i][0]] = data[i][1];
    i++;
  }

  return hash;
}

/* AST nodes */

function HtmlNode(text, loc) {
  this.type = "HTML";
  this.body = text;
  this.loc = loc;
}

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
  if (c.start !== null) {
    comp.push(c.start);
  }
  if (c.end !== null) {
    comp.push(c.end);
  }
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

function FunctionNode(name, args, loc) {
  this.type = "Function";
  this.name = name;
  this.args = args;
  this.loc = loc;
}

function ForNode(id, path, body, loc) {
  this.type = "For";
  this.id = id;
  this.path = path;
  this.body = body;
  this.loc = loc;
}

function IfNode(cond, v1, v2, body, else_body, loc) {
  this.type = "If";
  this.condition = cond;
  this.value_1 = v1;
  this.value_2 = v2;
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

function IncludeNode(path, loc) {
  this.type = "Include";
  this.path = path;
  this.loc = loc;
}

function FilterNode(filter, body, loc) {
  this.type = "Filter";
  this.body = [body];
  this.loc = loc;
}

/* expose AST constructors to parser */

parser.ast = {};
parser.ast.Loc = Loc;
parser.ast.HtmlNode = HtmlNode;
parser.ast.VoidTagNode = VoidTagNode;
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
parser.ast.FunctionNode = FunctionNode;
parser.ast.ForNode = ForNode;
parser.ast.IfNode = IfNode;
parser.ast.AliasNode = AliasNode;
parser.ast.IncludeNode = IncludeNode;
parser.ast.FilterNode = FilterNode;
