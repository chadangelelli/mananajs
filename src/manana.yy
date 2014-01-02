%start program

%options flex
%ebnf

%%

program
	: prog_list EOF 
    %{ 
      console.log("\n\n==>\n", JSON.stringify($prog_list,null, "\t"));
      console.log("\n\n==> %j\n", $prog_list); 
      return $1;
    %}
	;

prog_list
	: prog_list stmt { $1.push($2); $$ = $1; }
	| stmt           { $$ = [$1]; }
	;

block
	: INDENT stmt_list DEDENT { $$ = $2; }
	;

stmt_list
	: stmt_list stmt { $1.push($2); $$ = $1; }
	| stmt           { $$ = [$1]; }
	;

stmt
  : tag_stmt
  | void_tag_stmt
  | filter_stmt
	;

tag_stmt
  : tag END_TAG                  { $$ = $1; }
  | tag text END_TAG             { $$ = $1; $$.push($2); }
  | tag END_TAG block            { $$ = $1; $$.push($3); }
  | tag tag_attrs END_TAG        { $$ = $1; $$[1].push.apply($$[1], $2); }
  | tag tag_attrs text END_TAG   { $$ = $1; $$[1].push.apply($$[1], $2); $$.push($3); }
  | tag tag_attrs END_TAG block  { $$ = $1; $$[1].push.apply($$[1], $2); $$.push($4); }
  ;

tag
  : TAG { $$ = ['TAG', [$1]]; }
  ;

void_tag_stmt
  : void_tag END_TAG           { $$ = $1; }
  | void_tag tag_attrs END_TAG { $$ = $1; $$[1].push.apply($$[1], $2); }
  ;

void_tag
  : VOID_TAG { $$ = ['VOID_TAG', $1]; }
  ;

tag_attrs
  : tag_attrs tag_attr { $$ = $1; $$.push($2); }
  | tag_attr           { $$ = [$1]; }
  | tag_attr_args      { $$ = $1; }
  ;

tag_attr
  : TAG_ID                  { $$ = ['id', $1]; }
  | tag_classes             { $$ = ['class', $1.join(" ")]; }
  | TAG_ATTR EQ string      { $$ = ['ATTR', $1, $3]; }
  | TAG_DATA_ATTR EQ string { $$ = ['DATA', $1, $3]; }
  ;

tag_attr_args
  : LPAREN tag_attr_arg_list RPAREN { $$ = $2; }
  ;

tag_attr_arg_list
  : tag_attr_arg_list tag_attr_arg { $$ = $1; $$.push($2); }
  | tag_attr_arg                   { $$ = [$1]; }
  ;

tag_attr_arg
  : TAG_ATTR EQ STRING             { $$ = [$1, $3]; }
  | TAG_ATTR EQ STRING COMMA       { $$ = [$1, $3]; }
  | TAG_DATA_ATTR EQ STRING        { $$ = [$1, $3]; }
  | TAG_DATA_ATTR EQ STRING COMMA  { $$ = [$1, $3]; }
  ;

tag_classes
  : tag_classes TAG_CLASS { $$ = $1; $$.push($2); }
  | TAG_CLASS             { $$ = [$1]; }
  ;

filter_stmt
  : FILTER INDENT text DEDENT { $$ = ['FILTER', $1, $3]; }
  ;

text
  : word_list { $$ = ['TEXT', $1.join(' ')]; }
  ; 

word_list
  : word_list WORD { $$ = $1; $$.push($2); }
  | WORD           { $$ = [$1]; }
  ;

path
  : path DOT ID { $$ = $1; $$.push($3); }
  | path INDEX  { $$ = $1; $$.push($2); }
  | ID          { $$ = ['PATH', $1]; }
  ;




