%start program

%options flex
%ebnf

%%

program
	: prog_list EOF 
    %{ 
      console.log("\n\n==>\n", JSON.stringify($prog_list,null, "\t"));
      console.log("\n\n==>%j\n", $prog_list); 
      return $1;
    %}
	;

prog_list
	: prog_list stmt { $1.push($2); $$ = $1; }
	| stmt           { $$ = [$1]; }
	;

stmt_block
	: INDENT stmt_list DEDENT { $$ = [$stmt_list]; }
	;

stmt_list
	: stmt           { $$ = [$1]; }
	| stmt_list stmt { $1.push($2); $$ = $1; }
	;

stmt
  : tag_stmt
  | void_tag_stmt
  | for_stmt
  | text
  | fn
	;

tag_stmt
  : tag END_TAG                              { $$ = ['TAG', $1]; }
  | tag tag_attrs END_TAG                    { $$ = ['TAG', $1, $2]; }
  | tag END_TAG stmt_block                   { $$ = ['TAG', $1, $3]; }
  | tag tag_attrs END_TAG stmt_block         { $$ = ['TAG', $1, $2, $4]; }
  | tag inline_tag_content END_TAG           { $$ = ['TAG', $1, $2]; }
  | tag tag_attrs inline_tag_content END_TAG { $$ = ['TAG', $1, $2, $3]; }
  ;

tag
  : TAG { $$ = $1.slice(1); }
  ;

inline_tag_content
  : inline_tag_content inline_tag_el { $$ = $1; $$.push($2); }
  | inline_tag_el                    { $$ = [$1]; }
  ;

inline_tag_el
  : text
  | fn
  ;

void_tag_stmt
  : void_tag END_TAG            { $$ = ['VOID_TAG', $1]; }
  | void_tag tag_attrs END_TAG  { $$ = ['VOID_TAG', $1, $2]; }
  ;

void_tag
  : VOID_TAG { $$ = $1.slice(1); }
  ;

tag_attrs
  : tag_attrs tag_attr { $$ = $1; $$.push($2); }
  | tag_attr           { $$ = ['ATTRS', $1]; }
  ;

tag_attr
  : TAG_ID                   { $$ = ['ID', $1.slice(1)]; }
  | TAG_CLASS                { $$ = ['CLASS', $1.slice(1)]; }
  | TAG_ATTR EQ string       { $$ = ['ATTR', $1, $3]; }
  | TAG_DATA_ATTR EQ string  { $$ = ['DATA', $1.slice(1), $3]; }
  ;

for_stmt
  : FOR id IN id END_EXPR stmt_block                   { $$ = ['FOR', [$2], $4, $6]; }
  | FOR id COMMA id IN id END_EXPR stmt_block          { $$ = ['FOR', [$2, $4], $6, $8]; }
  | FOR id COMMA id COMMA id IN id END_EXPR stmt_block { $$ = ['FOR', [$2, $4, $6], $8, $10]; }
  ;

fn
  : FN END_FN 
    { $$ = ['FN', $1.slice(1, $1.length-1)]; }
  | FN fn_args END_FN
    %{ 
      var fn = ['FN', $1.slice(1, $1.length-1), $2];
      if ( ! fn[1].length) {
        fn[1] = '@';
      }
      $$ = fn;
    %}
  ;

fn_args
  : fn_args COMMA fn_arg { $$ = $1; $$.push($3); }
  | fn_arg               { $$ = ['ARGS', $1]; }
  ;

fn_arg
  : path
  | string
  ;

path
  : path DOT path_el { $$ = $1; $$.push($3); }
  | path_el          { $$ = ['PATH', $1]; }
  ;

path_el
  : ID { $$ = $1; }
  ;

text
  : TEXT { $$ = ['TEXT', $1]; }
  ;

id
  : ID { $$ = ['ID', $1]; }
  ;

string
  : STRING { $$ = $1.slice(1, $1.length-1); }
  ;

