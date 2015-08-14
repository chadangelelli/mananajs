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
  | code_tag_stmt
  | tag_stmt
  | filter_stmt
  | alias_stmt
  | unalias_stmt
  | include_stmt
  | with_stmt
  | if_stmt
  | switch_stmt
  | for_stmt 
  | name
  | fn
  | break
  | continue
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

code_tag_stmt
  : CODE_TAG END_CODE_TAG code DEDENT           { $$ = new CodeTagNode($1, null, $3, new Loc(@1, @3)); }
  | CODE_TAG tag_attrs END_CODE_TAG code DEDENT { $$ = new CodeTagNode($1, $2,   $4, new Loc(@1, @4)); }
  ;

code
  : code line { $$ = $1; $$.push($2); }
  | line      { $$ = [$1]; }
  ;

line
  : INDENT LINE { $$ = $1 + $2 }
  | BLANK_LINE  { $$ = ''; }
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
  : FILTER INDENT text DEDENT        { $$ = new FilterNode($1, $3, new Loc(@1, @3)); }
  | INLINE_TEXT text END_INLINE_TEXT { $$ = new FilterNode($1, $2, new Loc(@1, @3)); }
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
  : WITH path END_EXPR block       { $$ = new WithNode($2, null, $4, new Loc(@1, @4)); }
  | WITH path AS ID END_EXPR block { $$ = new WithNode($2, $4  , $6, new Loc(@1, @6)); }
  ;

for_stmt
  : FOR ID IN path END_EXPR block   { $$ = new ForNode($2, $4, $6, new Loc(@1, @6)); }
  | FOR ID IN string END_EXPR block { $$ = new ForNode($2, $4, $6, new Loc(@1, @6)); }
  ;

break
  : BREAK { $$ = new BreakNode(new Loc(@1, @1)); }
  ;

continue
  : CONTINUE { $$ = new ContinueNode(new Loc(@1, @1)); }
  ;

if_stmt
  : ifs { $$ = new IfNode($1, new Loc(@1, @1)); }
  ;

ifs
  : if            { $$ = [$1]; }
  | if else       { $$ = [$1]; $$.push($2); }
  | if elifs      { $$ = [$1]; $$.push.apply($$, $2); }
  | if elifs else { $$ = [$1]; $$.push.apply($$, $2); $$.push($3); }
  ;

if 
  : IF exprs END_EXPR block { $$ = new ConditionBranch($1, $2, $4, new Loc(@1, @4)); }
  ;

elifs
  : elif       { $$ = [$1]; }
  | elifs elif { $$ = $1; $$.push($2); }
  ;

elif
  : ELIF exprs END_EXPR block { $$ = new ConditionBranch($1, $2, $4, new Loc(@1, @4)); }
  ;

else
  : ELSE END_EXPR block { $$ = new ConditionBranch($1, [], $3, new Loc(@1, @3)); }
  ;

exprs
  : expr           { $$ = [$1]; }
  | exprs AND expr { $$ = $1; $3.relation = $2; $$.push($3); }
  | exprs OR expr  { $$ = $1; $3.relation = $2; $$.push($3); }
  ;

expr                       /* ExpressionNode(op  , v1, v2  , _negate, loc) */
  : EXISTS ev      { $$ = new ExpressionNode($1  , $2, null, false  , new Loc(@1, @2)); }
  | NOT EXISTS ev  { $$ = new ExpressionNode($2  , $3, null, true   , new Loc(@1, @3)); }
  | ev OP ev       { $$ = new ExpressionNode($2  , $1, $3  , false  , new Loc(@1, @3)); }
  | ev             { $$ = new ExpressionNode(true, $1, null, false  , new Loc(@1, @1)); }
  | NOT ev         { $$ = new ExpressionNode(true, $2, null, true   , new Loc(@1, @2)); }
  | ev IN ev       { $$ = new ExpressionNode($2  , $1, $3  , false  , new Loc(@1, @3)); }
  | ev NOT IN ev   { $$ = new ExpressionNode($3  , $1, $4  , true   , new Loc(@1, @4)); }
  | ev IS TYPE     { $$ = new ExpressionNode($2  , $1, $3  , false  , new Loc(@1, @3)); } 
  | ev NOT IS TYPE { $$ = new ExpressionNode($3  , $1, $4  , true   , new Loc(@1, @4)); }
  ;

ev
  : string
  | INT
  | bool 
  | path
  | fn
  ;

switch_stmt
  : CASE ev END_EXPR INDENT cases DEDENT      { $$ = new SwitchNode($2, $5, null   , new Loc(@1, @6)); }
  | CASE ev END_EXPR INDENT cases else DEDENT { $$ = new SwitchNode($2, $5, $6.body, new Loc(@1, @7)); }
  ;

cases
  : case       { $$ = [$1]; }
  | cases case { $$ = $1; $$.push($2); }
  ;

case
  : WHEN ev END_EXPR block { $$ = { value: $2, block: $4 }; }
  ;

alias_stmt
  : ALIAS path_or_fn AS ID END_EXPR { $$ = new AliasNode($2, $4, new Loc(@1, @5)); }
  ;

unalias_stmt
  : UNALIAS ID END_EXPR { $$ = new UnaliasNode($2, new Loc(@1, @2)); }
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
  | ID LBRACK COLON INT RBRACK       { $$ = new IdNode($1, '*' , $4  , new Loc(@1, @5)); }
  | ID LBRACK INT COLON RBRACK       { $$ = new IdNode($1, $3  , '*' , new Loc(@1, @5)); }
  | ID LBRACK string RBRACK          { $$ = new IdNode($1, $3  , null, new Loc(@1, @4)); }
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
  | bool 
  | TYPE
  | ID EQ path   { $$ = $3; }
  | ID EQ INT    { $$ = $3; }
  | ID EQ string { $$ = $3; }
  | ID EQ fn     { $$ = $3; }
  | ID EQ hash   { $$ = $3; }
  | ID EQ bool   { $$ = $3; }
  | ID EQ TYPE   { $$ = $3; }
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
  | bool 
  | string
  | fn
  | hash
  | path
  ;

name
  : START_NAME path RBRACE                    { $$ = new NameNode($2, null, new Loc(@1, @3)); }
  | START_NAME path COMMA name_default RBRACE { $$ = new NameNode($2, $4  , new Loc(@1, @5)); }
  ;

name_default
  : string
  | INT
  | bool 
  | path
  | fn
  ;

bool
  : BOOL { $$ = new MananaBooleanNode($1, new Loc(@1, @1)); }
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
  this.tag = tag;
  this.attrs = attrs;
  this.loc = loc;
}

function CodeTagNode(tag, attrs, code, loc) {
  this.type = "CodeTag";
  this.tag = tag;
  this.attrs = attrs;
  this.body = code;
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

function NameNode(path, default_value, loc) {
  this.type = "Name";
  this.path = path;
  this.default_value = default_value;
  this.loc = loc;
}

function WithNode(path, name, body, loc) {
  this.type = "With";
  this.path = path;
  this.name = name;
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

function IfNode(body, loc) {
  this.type = "If";
  this.body = body;
  this.loc = loc;
}

function ConditionBranch(branch, exprs, body, loc) {
  this.type = "ConditionBranch";
  this.branch = branch;
  this.expressions = exprs;
  this.body = body;
  this.loc = loc;
}

function ExpressionNode(op, v1, v2, _negate, loc) {
  this.type = "ExpressionNode";
  this.operator = op;
  this.value1 = v1;
  this.value2 = v2;
  this.negate = _negate;
  this.relation = null; // relation gets set in "exprs" production
  this.loc = loc;
}

function SwitchNode(control, cases, else_case, loc) {
  this.type = "Switch";
  this.control = control;
  this.cases = cases;
  this.else_case = else_case;
  this.loc = loc;
}

function AliasNode(path, id, loc) {
  this.type = "Alias";
  this.path = path;
  this.id = id;
  this.loc = loc;
}

function UnaliasNode(id, loc) {
  this.type = "Unalias";
  this.id = id;
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

function MananaStringNode(body, loc) {
  this.type = "MananaString";
  if (typeof body === "string") {
    this.body = [body];
  } else {
    this.body = body;
  }
  this.loc = loc;
}

function MananaBooleanNode(value, loc) {
  this.type = "MananaBoolean";
  this.value = value === "true";
  this.loc = loc;
}

function BreakNode(loc) {
  this.type = "Break";
  this.loc = loc;
}

function ContinueNode(loc) {
  this.type = "Continue";
  this.loc = loc;
}

/* expose AST constructors to parser */

parser.ast = {};
parser.ast.Loc = Loc;
parser.ast.MananaStringNode = MananaStringNode;
parser.ast.VoidTagNode = VoidTagNode;
parser.ast.CodeTagNode = CodeTagNode;
parser.ast.TagNode = TagNode;
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
parser.ast.ConditionBranch = ConditionBranch;
parser.ast.ExpressionNode = ExpressionNode;
parser.ast.SwitchNode = SwitchNode;
parser.ast.AliasNode = AliasNode;
parser.ast.UnaliasNode = UnaliasNode;
parser.ast.IncludeNode = IncludeNode;
parser.ast.FilterNode = FilterNode;
parser.ast.BreakNode = BreakNode;
parser.ast.ContinueNode = ContinueNode;
