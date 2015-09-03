%start manana
%options flex
%%

manana
  : ast EOF {return $1;}
  ;

ast
  : ast stmt {$$ = $1; $$.push($2);}
  | stmt     {$$ = [$1];}
  | block    {$$ = $1;}
  ;

block
  : INDENT stmts DEDENT {$$ = $2;}
  ;

stmts
  : stmts stmt {$1.push($2); $$ = $1;}
  | stmt       {$$ = [$1];}
  ;

stmt
  : tag
  | void
  | RAW text {$$ = $2;}
  | condition 
  | for
  | alias
  | unalias
  | include
  | switch
  | with
  | code
  | FILTER INDENT text DEDENT {$$ = new FilterNode($1, $3, new Loc(@1, @3));}
  | BREAK                     {$$ = new BreakNode(new Loc(@1, @1));}
  | CONTINUE                  {$$ = new ContinueNode(new Loc(@1, @1));}
  ;

tag
  : TAG shorthandattrs block {$$ = new TagNode($1, $2  , $3  , new Loc(@1, @3));}
  | TAG shorthandattrs text  {$$ = new TagNode($1, $2  , [$3], new Loc(@1, @3));}
  | TAG shorthandattrs       {$$ = new TagNode($1, $2  , []  , new Loc(@1, @2));}
  | TAG attrlist block       {$$ = new TagNode($1, $2  , $3  , new Loc(@1, @3));}
  | TAG attrlist text        {$$ = new TagNode($1, $2  , [$3], new Loc(@1, @3));}
  | TAG attrlist             {$$ = new TagNode($1, $2  , []  , new Loc(@1, @2));}
  | TAG block                {$$ = new TagNode($1, null, $2  , new Loc(@1, @2));}
  | TAG text                 {$$ = new TagNode($1, null, [$2], new Loc(@1, @2));}
  | TAG                      {$$ = new TagNode($1, null, []  , new Loc(@1, @1));}
                             
  | VOIDTAG                  {$$ = new VoidTagNode($1, null, new Loc(@1, @1));}
  | VOIDTAG shorthandattrs   {$$ = new VoidTagNode($1, $2  , new Loc(@1, @2));}
  | VOIDTAG attrlist         {$$ = new VoidTagNode($1, $2  , new Loc(@1, @2));}
  ;

shorthandattrs
  : shorthandattrs shorthandattr 
    %{
      var key = $2[0];
      var val = $2[1];

      $$ = $1;
      if (key === "class" && "class" in $$) { 
        $$.class += ' ' + val;
      } else {
        $$[key] = val;
      }
    %}
  | shorthandattr
    {$$ = {}; $$[$1[0]] = $1[1];}

  ;

shorthandattr
  : TAGID    {$$ = ["id", $1];}
  | TAGCLASS {$$ = ["class", $1];}
  | TAGSRC   {$$ = ["src", new StringNode($1, new Loc(@1, @1))];}
  ;

attrlist
  : ATTR '=' string              {$$ = {}; $$[$1] = $3;}
  | DATAATTR '=' string          {$$ = {}; $$["data-"+$1.slice(1)] = $3;}
  | attrlist ATTR '=' string     {$$ = $1; $$[$2] = $4;} 
  | attrlist DATAATTR '=' string {$$ = $1; $$["data-"+$2.slice(1)] = $4;} 
  | '(' attrlist ')'             {$$ = $2;}
  ;

void_tag_stmt
  : VOIDTAG       {$$ = new VoidTagNode($1, null, new Loc(@1, @1));}
  | VOIDTAG attrs {$$ = new VoidTagNode($1, $2,   new Loc(@1, @2));}
  ;

code
  : CODETAG src DEDENT       {$$ = new CodeTagNode($1, null, $2, new Loc(@1, @2));}
  | CODETAG attrs src DEDENT {$$ = new CodeTagNode($1, $2,   $3, new Loc(@1, @3));}
  ;

src
  : src srcline {$$ = $1; $$.push($2);}
  | srcline     {$$ = [$1];}
  ;

srcline
  : INDENT LINE {$$ = $1 + $2 }
  | BLANKLINE  {$$ = '';}
  ;

condition
  : branches {$$ = new IfNode($1, new Loc(@1, @1));}
  ;

branches
  : if            {$$ = [$1];}
  | if else       {$$ = [$1]; $$.push($2);}
  | if elifs      {$$ = [$1]; $$.push.apply($$, $2);}
  | if elifs else {$$ = [$1]; $$.push.apply($$, $2); $$.push($3);}
  ;

if
  : IF exprs block {$$ = new ConditionBranchNode($1, $2, $3, new Loc(@1, @3));}
  ;

elifs
  : elif       {$$ = [$1];}
  | elifs elif {$$ = $1; $$.push($2);}
  ;

elif
  : ELIF exprs block {$$ = new ConditionBranchNode($1, $2, $3, new Loc(@1, @3));}
  ;

else
  : ELSE block {$$ = new ConditionBranchNode($1, [], $2, new Loc(@1, @2));}
  ;

exprs
  : expr           {$$ = [$1];}
  | exprs AND expr {$$ = $1; $3.relation = $2; $$.push($3);}
  | exprs OR expr  {$$ = $1; $3.relation = $2; $$.push($3);}
  ;

expr                       /* ExpressionNode(op  , v1, v2  , _negate, loc) */
  : EXISTS ev      {$$ = new ExpressionNode($1  , $2, null, false  , new Loc(@1, @2));}
  | NOT EXISTS ev  {$$ = new ExpressionNode($2  , $3, null, true   , new Loc(@1, @3));}
  | ev OP ev       {$$ = new ExpressionNode($2  , $1, $3  , false  , new Loc(@1, @3));}
  | ev             {$$ = new ExpressionNode(true, $1, null, false  , new Loc(@1, @1));}
  | NOT ev         {$$ = new ExpressionNode(true, $2, null, true   , new Loc(@1, @2));}
  | ev IN ev       {$$ = new ExpressionNode($2  , $1, $3  , false  , new Loc(@1, @3));}
  | ev NOT IN ev   {$$ = new ExpressionNode($3  , $1, $4  , true   , new Loc(@1, @4));}
  | ev IS TYPE     {$$ = new ExpressionNode($2  , $1, $3  , false  , new Loc(@1, @3));}
  | ev NOT IS TYPE {$$ = new ExpressionNode($3  , $1, $4  , true   , new Loc(@1, @4));}
  ;

ev
  : path
  | fn
  | string
  | INT
  | bool
  ;

alias
  : ALIAS path AS ID {$$ = new AliasNode($2, $4, new Loc(@1, @4));}
  | ALIAS fn AS ID   {$$ = new AliasNode($2, $4, new Loc(@1, @4));}
  ;

unalias
  : UNALIAS ID {$$ = new UnaliasNode($2, new Loc(@1, @2));}
  ;

include
  : INCLUDE string {$$ = new IncludeNode($2, new Loc(@1, @2));}
  | INCLUDE path   {$$ = new IncludeNode($2, new Loc(@1, @2));}
  ;

for
  : FOR ID IN path block   {$$ = new ForNode($2, $4, $5, new Loc(@1, @5));}
  | FOR ID IN string block {$$ = new ForNode($2, $4, $5, new Loc(@1, @5));}
  ;

switch
  : CASE ev INDENT cases DEDENT      {$$ = new SwitchNode($2, $4, null   , new Loc(@1, @5));}
  | CASE ev INDENT cases else DEDENT {$$ = new SwitchNode($2, $4, $5.body, new Loc(@1, @6));}
  ;

cases
  : case       {$$ = [$1];}
  | cases case {$$ = $1; $$.push($2);}
  ;

case
  : WHEN ev block {$$ = { value: $2, block: $3 };}
  ;

with
  : WITH path block       {$$ = new WithNode($2, null, $3, new Loc(@1, @3));}
  | WITH path AS ID block {$$ = new WithNode($2, $4  , $5, new Loc(@1, @5));}
  ;

text
  : text TEXT {$1.body.push($2); $$ = $1;}
  | text name {$1.body.push($2); $$ = $1;}
  | text fn   {$1.body.push($2); $$ = $1;}
  | TEXT      {$$ = new TextNode($1.replace(/^\s+/,""), false, new Loc(@1, @1));}
  | name      {$$ = new TextNode($1                   , true , new Loc(@1, @1));}
  | fn        {$$ = new TextNode($1                   , true , new Loc(@1, @1));}
  ;

string
  : STR  {$$ = new StringNode($1, new Loc(@1, @1));}
  | ISTR 
    %{
      $$ = new StringNode($1.slice(1), new Loc(@1, @1)); 
      console.log("Mañana WARNING: Interpolated strings are deprecated.");
      console.log("\tUse new-style strings (\"abc@{d}e\") without the \"i\"");
      console.log("\tIn VIM run: %s/=i\"/=\"/g");
      console.log("\tAt Command Line run: cd /dir/path && find . -type f -exec sed -i '' 's/=i\"/=\"/' {} \\;");
    %}
  ;

name
  : NSTART path NSTOP               {$$ = new NameNode($2, null, new Loc(@1, @1));}
  | NSTART path COMMA default NSTOP {$$ = new NameNode($2, $4  , new Loc(@1, @5));}
  ;

default
  : string
  | INT
  | bool
  | path
  | fn
  ;

path
  : id          {$$ = new PathNode(null, $1, new Loc(@1, @1));}
  | path '.' id {$$ = new PathNode($1  , $3, new Loc(@1, @3));}
  ;

id
  : ID                       {$$ = new IdNode($1, null, null, new Loc(@1, @1));}
  | ID '[' INT ']'           {$$ = new IdNode($1, $3  , null, new Loc(@1, @4));}
  | ID '[' INT ':' INT  ']'  {$$ = new IdNode($1, $3  , $5  , new Loc(@1, @6));}
  | ID '[' INT ':' path ']'  {$$ = new IdNode($1, $3  , $5  , new Loc(@1, @6));}
  | ID '[' path ']'          {$$ = new IdNode($1, $3  , null, new Loc(@1, @4));}
  | ID '[' path ':' INT  ']' {$$ = new IdNode($1, $3  , $5  , new Loc(@1, @6));}
  | ID '[' path ':' path ']' {$$ = new IdNode($1, $3  , $5  , new Loc(@1, @6));}
  | ID '[' ':' INT ']'       {$$ = new IdNode($1, '*' , $4  , new Loc(@1, @5));}
  | ID '[' INT ':' ']'       {$$ = new IdNode($1, $3  , '*' , new Loc(@1, @5));}
  | ID '[' string ']'        {$$ = new IdNode($1, $3  , null, new Loc(@1, @4));}
  ;

fn
  : FN RPAREN        {$$ = new FunctionNode($1, null, new Loc(@1, @2));}
  | FN fnargs RPAREN {$$ = new FunctionNode($1, $2  , new Loc(@1, @3));}
  ;

fnargs
  : fnargs COMMA fnarg {$$ = $1; $$.push($3);}
  | fnarg              {$$ = [$1];}
  ;

fnarg
  : path
  | INT
  | string
  | fn
  | hash
  | bool
  | TYPE
  | ID EQ path   {$$ = $3;}
  | ID EQ INT    {$$ = $3;}
  | ID EQ string {$$ = $3;}
  | ID EQ fn     {$$ = $3;}
  | ID EQ hash   {$$ = $3;}
  | ID EQ bool   {$$ = $3;}
  | ID EQ TYPE   {$$ = $3;}
  ;

bool
  : BOOL {$$ = $1 === "true";}
  ;

%%

//_____________________________________________________ Location
function Loc(start, end) {
  this.start = { line: start.first_line, column: start.first_column };
  this.end = { line: end.last_line, column: end.last_column };
}

//_____________________________________________________ Errors
/*
parser.MananaParseError = function(message) {
  this.name = 'parser.MananaParseError';
  this.message = message || 'Parse Error';
  this.stack = (new Error()).stack || "Not available";
};
parser.MananaParseError.prototype = Object.create(Error.prototype);
parser.MananaParseError.prototype.constructor = parser.MananaParseError;
*/

parser.parseError = function(str, hash) {
  if (hash.recoverable) {
    this.trace(str);
  } else {
    //console.log("\n\n");
    //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    //console.log("Mañana Parse Error:");
    //console.log("\tstates: ", parser.lexer.conditionStack);
    //console.log("\tline: ", parser.lexer.yylineno + 1);
    //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    //console.log("\n\n");

    throw new Error(str);
  }
};

//_____________________________________________________ AST
function VoidTagNode(tag, attrs, loc) {
  this.type = "VoidTag";
  this.tag = tag;
  this.attrs = attrs;
  this.loc = loc;
}

function TagNode(tag, attrs, body, loc) {
  this.type = "Tag";
  this.tag = tag;
  this.attrs = attrs;
  this.body = body;
  this.loc = loc;
}

function CodeTagNode(tag, attrs, code, loc) {
  this.type = "CodeTag";
  this.tag = tag;
  this.attrs = attrs;
  this.body = code;
  this.loc = loc;
}

function TextNode(el, _is_name, loc) {
  this.type = "Text";
  this.loc = loc;

  if (_is_name && (el[0] === ' ' || el[0] === '\t')) {
    el = el.replace(/^\s+/,"");
  }

  this.body = [el]; 
}

function NameNode(path, default_value, loc) {
  this.type = "Name";
  this.path = path;
  this.default_value = default_value;
  this.loc = loc;
}

function IdNode(id, start, end, loc) {
  this.type = "Id";
  this.id = id;
  this.start = start;
  this.end = end;
  this.loc = loc;
}

function PathNode(path_node, component, loc) {
  var k, c;

  if (path_node === null) {
    this.type = "Path";
    this.loc = loc;
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
}

function FilterNode(filter, body, loc) {
  this.type = "Filter";
  this.body = [body];
  this.loc = loc;
}

function StringNode(str, loc) {
  this.type = "String";
  this.body = str;
  this.loc = loc;
}

function IfNode(body, loc) {
  this.type = "If";
  this.body = body;
  this.loc = loc;
}

function ConditionBranchNode(branch, exprs, body, loc) {
  this.type = "ConditionBranchNode";
  this.branch = branch;
  this.expressions = exprs;
  this.body = body;
  this.loc = loc;
}

function ExpressionNode(op, v1, v2, _negate, loc) {
  this.type = "Expression";
  this.operator = op;
  this.value1 = v1;
  this.value2 = v2;
  this.negate = _negate;
  this.relation = null; // relation gets set in "exprs" production
  this.loc = loc;
}

function FunctionNode(name, args, loc) {
  this.type = "Function";
  this.name = name;
  this.args = args;
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

function ForNode(id, path, body, loc) {
  this.type = "For";
  this.id = id;
  this.path = path;
  this.body = body;
  this.loc = loc;
}

function SwitchNode(control, cases, else_case, loc) {
  this.type = "Switch";
  this.control = control;
  this.cases = cases;
  this.else_case = else_case;
  this.loc = loc;
}

function WithNode(path, name, body, loc) {
  this.type = "With";
  this.path = path;
  this.name = name;
  this.body = body;
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

parser.ast = {};
parser.ast.Loc = Loc;
parser.ast.VoidTagNode = VoidTagNode;
parser.ast.CodeTagNode = CodeTagNode;
parser.ast.TagNode = TagNode;
parser.ast.TextNode = TextNode;
parser.ast.NameNode = NameNode;
parser.ast.IdNode = IdNode;
parser.ast.PathNode = PathNode;
parser.ast.FilterNode = FilterNode;
parser.ast.StringNode = StringNode;
parser.ast.IfNode = IfNode;
parser.ast.ConditionBranchNode = ConditionBranchNode;
parser.ast.ExpressionNode = ExpressionNode;
parser.ast.FunctionNode = FunctionNode;
parser.ast.AliasNode = AliasNode;
parser.ast.ForNode = ForNode;
parser.ast.SwitchNode = SwitchNode;
parser.ast.WithNode = WithNode;
parser.ast.BreakNode = BreakNode;
parser.ast.ContinueNode = ContinueNode;
