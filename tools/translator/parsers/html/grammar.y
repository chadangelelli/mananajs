%start program
%options flex
%%

program
  : tokens EOF { return $1; }
  ;

tokens
  : token        { $$ = [$1]; }
  | tokens token { $$ = $1; $$.push($2); }
  ;

token
  : tag
  | closetag
  | text
  ;

tag
  : TAG TAGEND       { $$ = new TagNode($1, null, new Loc(@1, @2)); } 
  | TAG attrs TAGEND { $$ = new TagNode($1, $2  , new Loc(@1, @3)); }
  ;

attrs
  : attr       { $$ = [$1]; }
  | attrs attr { $$ = $1; $$.push($2); }
  ;

attr
  : ATTR EQ STRING     { $$ = new AttrNode($1, $3, new Loc(@1, @3)); }
  | DATAATTR EQ STRING { $$ = new DataAttrNode($1, $3, new Loc(@1, @3)); }
  ;

closetag
  : CLOSETAG { $$ = new CloseTagNode($1, new Loc(@1, @1)); }
  ;

text
  : TEXT { $$ = new TextNode($1, new Loc(@1, @1)); }
  ;

%%

function Loc(start, end) {
  this.start = { line: start.first_line, column: start.first_column };
  this.end = { line: end.last_line, column: end.last_column };
}

function TagNode(tag, attrs, loc) {
  this.type = "Tag";
  this.tag = tag;
  this.attrs = attrs;
  this.loc = loc;
}

function AttrNode(attr, val, loc) {
  this.type = "Attr";
  this.name = attr;
  this.value = val;
  this.loc = loc;
}

function DataAttrNode(attr, val, loc) {
  this.type = "DataAttr";
  this.name = attr;
  this.value = val;
  this.loc = loc;
}

function CloseTagNode(tag, loc) {
  this.type = "CloseTag";
  this.tag = tag;
  this.loc = loc;
}

function TextNode(text, loc) {
  this.type = "Text";
  this.text = text;
  this.loc = loc;
}

parser.ast = {};
parser.ast.Loc = Loc;
parser.ast.TagNode = TagNode;
parser.ast.AttrNode = AttrNode;
parser.ast.DataAttrNode = DataAttrNode;
parser.ast.CloseTagNode = CloseTagNode;
parser.ast.TextNode = TextNode;
