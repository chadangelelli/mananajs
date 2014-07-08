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
  | code_stmt
  | alias_stmt
  | include_stmt
  | with_stmt
  | if_stmt
  | for_stmt 
  | name
  | fn
  ;

html_stmt
  : HTML { $$ = new MananaStringNode($1, new Loc(@1, @1)); }
  | i_html
  ;

i_html
  : I_HTML_START i_html_text I_HTML_END 
    %{ 
      var body = [$1];
      body.push.apply(body, $2);
      body.push($3);
      $$ = new MananaStringNode(body, new Loc(@1, @3)); 
    %}
  ;

i_html_text
  : i_html_text i_html_text_el { $$ = $1; $$.push($2); }
  | i_html_text_el             { $$ = [$1]; }
  ;

i_html_text_el
  : I_HTML_TEXT
  | name
  ;

void_tag_stmt
  : void_tag END_TAG           { $$ = new VoidTagNode($1, null, new Loc(@1, @1)); }
  | void_tag tag_attrs END_TAG { $$ = new VoidTagNode($1, $2,   new Loc(@1, @2)); } 
  ;
void_tag
  : VOID_TAG { $$ = $1; }
  ;

tag_stmt
  : regular_tag
  | pre_tag
  ;

regular_tag
  : tag END_TAG                     { $$ = new TagNode($1, null, null, null, new Loc(@1, @1)); }
  | tag text END_TAG                { $$ = new TagNode($1, null, $2,   null, new Loc(@1, @2)); }
  | tag END_TAG block               { $$ = new TagNode($1, null, null, $3,   new Loc(@1, @3)); }
  | tag tag_attrs END_TAG           { $$ = new TagNode($1, $2,   null, null, new Loc(@1, @2)); }
  | tag tag_attrs text END_TAG      { $$ = new TagNode($1, $2,   $3,   null, new Loc(@1, @3)); }
  | tag tag_attrs END_TAG block     { $$ = new TagNode($1, $2,   null, $4,   new Loc(@1, @4)); }
  ;

pre_tag
  : PRE_TAG pre_block           { $$ = new PreTagNode($1, null, $2, new Loc(@1, @2)); }
  | PRE_TAG tag_attrs pre_block { $$ = new PreTagNode($1, $2,   $3, new Loc(@1, @3)); }
  ;

pre_block
  : FILTER_START pre_text DEDENT { $$ = $2; }
  ;

pre_text
  : pre_text LINE { $$ = $1; $$.push($2); }
  | LINE          { $$ = [$1]; }
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
  | TAG_SRC                 { $$ = ['src', new MananaStringNode($1, new Loc(@1, @1)) ]; }
  | TAG_SRC_I_STRING string { $$ = ['src', $2]; }
  | tag_classes             { $$ = ['class', $1.join(" ")]; }
  | TAG_ATTR EQ string      { $$ = ['attr', $1, $3]; }
  | TAG_DATA_ATTR EQ string { $$ = ['data', $1, $3]; }
  ;

tag_attr_args
  : LPAREN tag_attr_arg_list RPAREN     { $$ = $2; }
  | LBRACE tag_attr_arg_list_alt RBRACE { $$ = $2; }
  ;

tag_attr_arg_list
  : tag_attr_arg_list tag_attr_arg { $$ = $1; $$.push($2); }
  | tag_attr_arg                   { $$ = [$1]; }
  ;

tag_attr_arg
  : TAG_ATTR EQ string            { $$ = [$1, $3]; }
  | TAG_ATTR EQ string COMMA      { $$ = [$1, $3]; }
  | TAG_DATA_ATTR EQ string       { $$ = [$1, $3]; }
  | TAG_DATA_ATTR EQ string COMMA { $$ = [$1, $3]; }
  ;

tag_attr_arg_list_alt
  : tag_attr_arg_list_alt tag_attr_arg_alt { $$ = $1; $$.push($2); }
  | tag_attr_arg_alt                       { $$ = [$1]; }
  ;

tag_attr_arg_alt
  : TAG_ATTR COLON string            { $$ = [$1, $3]; }
  | TAG_ATTR COLON string COMMA      { $$ = [$1, $3]; }
  | TAG_DATA_ATTR COLON string       { $$ = [$1, $3]; }
  | TAG_DATA_ATTR COLON string COMMA { $$ = [$1, $3]; }
  ;

tag_classes
  : tag_classes TAG_CLASS { $$ = $1; $$.push($2); }
  | TAG_CLASS             { $$ = [$1]; }
  ;

filter_stmt
  : FILTER FILTER_START text DEDENT { $$ = new FilterNode($1, $3, new Loc(@1, @3)); }
  ;

code_stmt
  : CODE_START FILTER_START code DEDENT { $$ = new CodeNode($3, $1, new Loc(@1, @4)); }
  ;

code
  : code CODE { $$ = $1; $$.push($2); }
  | CODE      { $$ = [$1]; }
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
 | fn
 | string
 | SPACE
 ;

path_or_fn
  : path
  | fn
  ;

with_stmt
  : WITH path_or_fn AS ID END_EXPR block { $$ = new WithNode($2, $4, $6, new Loc(@1, @6)); } 
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

  | IF EXISTS ev END_EXPR block
    { $$ = new IfNode("exists", $3, null, $5, null, new Loc(@1, @5)); }

  | IF EXISTS ev END_EXPR block ELSE END_EXPR block
    { $$ = new IfNode("exists", $3, null, $5, $8, new Loc(@1, @8)); }
  ;

ev
  : string
  | INT
  | BOOL
  | path
  | fn
  ;

alias_stmt
  : ALIAS path_or_fn AS ID END_EXPR { $$ = new AliasNode($2, $4, new Loc(@1, @5)); }
  ;

include_stmt
  : INCLUDE string END_EXPR { $$ = new IncludeNode($2, new Loc(@1, @2)); }
  | INCLUDE path END_EXPR   { $$ = new IncludeNode($2, new Loc(@1, @2)); }
  ;

path
  : id             { $$ = new PathNode(null, $1  , null, new Loc(@1, @1)); }
  | path DOT id    { $$ = new PathNode($1  , $3  , null, new Loc(@1, @3)); }
  | path DOT meths { $$ = new PathNode($1  , null, $3  , new Loc(@1, @3)); }
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
  | string
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
  | string
  | fn
  | hash
  ;

hash
  : LBRACE hash_data RBRACE       { $$ = new MananaHash($2); }
  | LBRACE hash_data COMMA RBRACE { $$ = new MananaHash($2); }
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
  | string
  | fn
  | hash
  | path
  ;

name
  : START_NAME path RBRACE { $$ = $2; }
  ;

string
  : STRING { $$ = new MananaStringNode($1, new Loc(@1, @1)); }
  | i_string
  ;

i_string
  : I_STRING_D i_string_text END_I_STRING_D { $$ = new MananaStringNode($2, new Loc(@1, @3)); }
  | I_STRING_S i_string_text END_I_STRING_S { $$ = new MananaStringNode($2, new Loc(@1, @3)); }
  ;

i_string_text
  : i_string_text i_string_text_el { $$ = $1; $$.push($2); }
  | i_string_text_el               { $$ = [$1]; }
  ;

i_string_text_el
  : name
  | I_STRING_TEXT
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

function VoidTagNode(tag, attrs, loc) {
  this.type = "VoidTag";
  this.loc = loc;
  this.tag = tag;
  this.attrs = attrs;
}

function TagNode(tag, attrs, text, block, loc) {
  this.type = "Tag";
  this.loc = loc;
  this.tag = tag;
  this.attrs = attrs;
  this.body = text ? [text] : block;
}

function PreTagNode(tag, attrs, text, loc) {
  this.type = "PreTag";
  this.loc = loc;
  this.tag = tag;
  this.attrs = attrs;
  this.body = text;
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
  this.loc = loc;
  this.body = path;
}

function WithNode(path, id, body, loc) {
  this.type = "With";
  this.loc = loc;
  this.path = path;
  this.id = id;
  this.body = body;
}

function IdNode(id, start, end, loc) {
  this.type = "Id";
  this.loc = loc;
  this.id = id;
  this.start = start;
  this.end = end;
}

function PathNode(path_node, component, methods, loc) {
  var k, c;

  if (path_node === null) {
    this.type = "Path";
    this.loc = loc;
    this.methods = null;
    this.components = [];
  } else {
    for (k in path_node) {
      if (path_node.hasOwnProperty(k)) {
        this[k] = path_node[k];
      }
    }

    if (loc && path_node.loc) {
      if (loc.end.line > path_node.loc.end.line || loc.end.column > path_node.loc.end.column) {
        this.loc.end = loc.end;
      }
    }
  }

  if (component) {
    c = [component.id];
    if (component.start !== null) {
      c.push(component.start);
    }
    if (component.end !== null) {
      c.push(component.end);
    }
    this.components.push(c);
  }

  if (methods !== null) {
    this.methods = methods;
  }
}

function MethodNode(name, args, loc) {
  this.type = "Method";
  this.loc = loc;
  this.name = name;
  this.args = args;
}

function MethodChainNode(method, loc) {
  this.type = "MethodChain";
  this.loc = loc;
  this.chain = [method];
}

function FunctionNode(name, args, loc) {
  this.type = "Function";
  this.loc = loc;
  this.name = name;
  this.args = args;
}

function ForNode(id, path, body, loc) {
  this.type = "For";
  this.loc = loc;
  this.id = id;
  this.path = path;
  this.body = body;
}

function IfNode(cond, v1, v2, body, else_body, loc) {
  this.type = "If";
  this.loc = loc;
  this.condition = cond;
  this.value_1 = v1;
  this.value_2 = v2;
  this.body = body;
  this.else_body = else_body;
}

function AliasNode(path, id, loc) {
  this.type = "Alias";
  this.loc = loc;
  this.path = path;
  this.id = id;
}

function IncludeNode(path, loc) {
  this.type = "Include";
  this.loc = loc;
  this.path = path;
}

function FilterNode(filter, body, loc) {
  this.type = "Filter";
  this.loc = loc;
  this.body = [body];
}

function CodeNode(code, language, loc) {
  this.type = "Code";
  this.loc = loc;
  this.language = language;
  this.body = code.join('');
}

function MananaStringNode(body, loc) {
  this.type = "MananaString";
  this.loc = loc;
  if (typeof body === "string") {
    this.body = [body];
  } else {
    this.body = body;
  }
}

/* expose AST constructors to parser */

parser.ast = {};
parser.ast.Loc = Loc;
parser.ast.MananaStringNode = MananaStringNode;
parser.ast.VoidTagNode = VoidTagNode;
parser.ast.TagNode = TagNode;
parser.ast.PreTagNode = PreTagNode;
parser.ast.TextNode = TextNode;
parser.ast.NameNode = NameNode;
parser.ast.WithNode = WithNode;
parser.ast.IdNode = IdNode;
parser.ast.PathNode = PathNode;
parser.ast.MethodNode = MethodNode;
parser.ast.MethodChainNode = MethodChainNode;
parser.ast.FunctionNode = FunctionNode;
parser.ast.ForNode = ForNode;
parser.ast.IfNode = IfNode;
parser.ast.AliasNode = AliasNode;
parser.ast.IncludeNode = IncludeNode;
parser.ast.FilterNode = FilterNode;
parser.ast.CodeNode = CodeNode;
