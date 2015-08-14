%start manana
%options flex
%%

manana
  : ast EOF { console.log(JSON.stringify($1, null, 4)); return $1; }
  ;

ast
  : ast stmt { $$ = $1; $$.push($2); }
  | stmt     { $$ = [$1]; }
  | block    { $$ = $1; }
  ;

block
  : INDENT stmts DEDENT { $$ = $2; }
  ;

stmts
  : stmts stmt { $1.push($2); $$ = $1; }
  | stmt       { $$ = [$1]; }
  ;

stmt
  : tag
  | RAW text                  { $$ = $2; }
  | FILTER INDENT text DEDENT { $$ = new FilterNode($1, $3, new Loc(@1, @3)); }
  ;

tag
  : TAG block { $$ = new TagNode($1, null, $2  , new Loc(@1, @2)); }
  | TAG text  { $$ = new TagNode($1, null, [$2], new Loc(@1, @2)); }
  | TAG       { $$ = new TagNode($1, null, []  , new Loc(@1, @1)); }

  | VOIDTAG   { $$ = new VoidTagNode($1, null, new Loc(@1, @1)); }
  ;

text
  : TEXT      { $$ = new TextNode($1, true , new Loc(@1, @1)); }
  | name      { $$ = new TextNode($1, false, new Loc(@1, @1)); }
  | text TEXT { $1.body.push($2); $$ = $1; }
  | text name { $1.body.push($2); $$ = $1; }
  ;

name
  : NSTART path NSTOP { $$ = new NameNode($2, null, new Loc(@1, @1)); }
  ;

path
  : id          { $$ = new PathNode(null, $1, null, new Loc(@1, @1)); }
  | path '.' id { $$ = new PathNode($1  , $3, null, new Loc(@1, @3)); }
  ;

id
  : ID                       { $$ = new IdNode($1, null, null, new Loc(@1, @1)); }
  | ID '[' INT ']'           { $$ = new IdNode($1, $3  , null, new Loc(@1, @4)); }
  | ID '[' INT ':' INT  ']'  { $$ = new IdNode($1, $3  , $5  , new Loc(@1, @6)); }
  | ID '[' INT ':' path ']'  { $$ = new IdNode($1, $3  , $5  , new Loc(@1, @6)); }
  | ID '[' path ']'          { $$ = new IdNode($1, $3  , null, new Loc(@1, @4)); }
  | ID '[' path ':' INT  ']' { $$ = new IdNode($1, $3  , $5  , new Loc(@1, @6)); }
  | ID '[' path ':' path ']' { $$ = new IdNode($1, $3  , $5  , new Loc(@1, @6)); }
  | ID '[' ':' INT ']'       { $$ = new IdNode($1, '*' , $4  , new Loc(@1, @5)); }
  | ID '[' INT ':' ']'       { $$ = new IdNode($1, $3  , '*' , new Loc(@1, @5)); }
  | ID '[' string ']'        { $$ = new IdNode($1, $3  , null, new Loc(@1, @4)); }
  ;

%%

function Loc(start, end) {
  this.start = { line: start.first_line, column: start.first_column };
  this.end = { line: end.last_line, column: end.last_column };
}

function VoidTagNode(tag, attrs, loc) {
  this.type = "VoidTag";
  this.tag = tag;
  this.attrs = attrs;
  this.loc = loc;
}

function TagNode(tag, attrs, body, loc) {
  this.type = "TagNode";
  this.tag = tag;
  this.attrs = attrs;
  this.body = body;
  this.loc = loc;
}

function TextNode(el, _is_str, loc) {
  this.type = "TextNode";
  this.loc = loc;

  if (_is_str && (el[0] === ' ' || el[0] === '\t')) {
    el = el.trimLeft();
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

parser.ast = {};
parser.ast.Loc = Loc;
parser.ast.VoidTagNode = VoidTagNode;
parser.ast.TagNode = TagNode;
parser.ast.TextNode = TextNode;
parser.ast.NameNode = NameNode;
parser.ast.IdNode = IdNode;
parser.ast.PathNode = PathNode;
parser.ast.FilterNode = FilterNode;
