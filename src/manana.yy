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
	: INDENT stmt_list DEDENT { $$ = $2; }
	;

stmt_list
	: stmt_list stmt { $1.push($2); $$ = $1; }
	| stmt           { $$ = [$1]; }
	;

stmt
  : tag_stmt
  | void_tag_stmt
  | for_stmt
  | text
  | fn
	;

tag_stmt
  : tag END_TAG                                 { $$ = $1; }
  | tag END_TAG stmt_block                      { $$ = $1; $$.push($3); }
  | tag tag_attrs END_TAG                       { $$ = $1; $$[1].push.apply($$[1], $2); }
  | tag tag_attrs END_TAG stmt_block            { $$ = $1; $$[1].push.apply($$[1], $2); $$.push($4); }
  | tag tag_text END_TAG                        { $$ = $1; $$.push([$2]); }
  | tag tag_attrs tag_text END_TAG              { $$ = $1; $$[1].push.apply($$[1], $2); $$.push([$3]); }
  | tag tag_text END_TAG stmt_block             %{ 
                                                  $$ = $1; 
                                                  var a = [$2];
                                                  a.push.apply(a, $4);
                                                  $$.push(a);
                                                %}
  | tag tag_attrs tag_text END_TAG stmt_block   %{ 
                                                  $$ = $1; 
                                                  $$[1].push.apply($$[1], $2); 
                                                  var a = [$3];
                                                  a.push.apply(a, $5);
                                                  $$.push(a);
                                                %}
  ;

tag
  : TAG { $$ = ['TAG', [['NAME', $1.slice(1)]]]; }
  ;

void_tag_stmt
  : void_tag END_TAG           { $$ = $1; }
  | void_tag tag_attrs END_TAG { $$ = $1; $$[1].push.apply($$[1], $2); }
  ;

void_tag
  : VOID_TAG { $$ = ['VOID_TAG', [['NAME', $1.slice(1)]]]; }
  ;

tag_attrs
  : tag_attrs tag_attr { $$ = $1; $$.push($2); }
  | tag_attr           { $$ = [$1]; }
  | tag_attr_hash      { $$ = $1; }
  ;

tag_attr
  : TAG_ID                   { $$ = ['ID', $1.slice(1)]; }
  | tag_classes              { $$ = $1; }
  | TAG_ATTR EQ string       { $$ = ['ATTR', $1, $3]; }
  | TAG_DATA_ATTR EQ string  { $$ = ['DATA', $1.slice(1), $3]; }
  ;

tag_attr_hash
  : TAG_ATTR_HASH tag_attr_hash_attrs END_ATTR_HASH { $$ = $2; }
  ;

tag_attr_hash_attrs
  : tag_attr_hash_attrs tag_attr_hash_attr { $$ = $1; $$.push($2); }
  | tag_attr_hash_attr                     { $$ = [$1]; }
  ;

tag_attr_hash_attr
  : TAG_ATTR COLON STRING       { $$ = [$1, $3]; }
  | TAG_ATTR COLON STRING COMMA { $$ = [$1, $3]; }
  ;

tag_classes
  : tag_classes tag_class { $$ = $1; $$.push($2); }
  | tag_class             { $$ = ['CLASS', $1]; }
  ;

tag_class
  : TAG_CLASS { $$ = $1.slice(1); }
  ;

tag_text
  : TAG_TEXT { $$ = ['TEXT', $1.replace(/^\s*~\s*/, '')]; }
  ;

for_stmt
  : FOR id IN id END_EXPR stmt_block                   { $$ = ['FOR', [$2, $4], $6]; }
  | FOR id COMMA id IN id END_EXPR stmt_block          { $$ = ['FOR', [$2, $4, $6], $8]; }
  | FOR id COMMA id COMMA id IN id END_EXPR stmt_block { $$ = ['FOR', [$2, $4, $6, $8], $10]; }
  ;

fn
  : FN END_FN                      %{ 
                                     var fn_name = $1.slice(1, $1.length-1);
                                     if ( ! fn_name) fn_name = '@';
                                     $$ = ['FN', [['NAME', fn_name]]]; 
                                   %}
  | FN fn_args END_FN              %{ 
                                     var fn_name = $1.slice(1, $1.length-1);
                                     if ( ! fn_name) fn_name = '@';
                                     $$ = ['FN', [['NAME', fn_name]]]; $$[1].push.apply($$[1], $2); 
                                   %}
  | FN fn_args END_FN CHAINED_FN   { $$ = ['x']; } 
  ;

fn_args
  : fn_args COMMA fn_arg { $$ = $1; $$.push($3); }
  | fn_arg               { $$ = [$1]; }
  ;

fn_arg
  : path
  | string
  | FLOAT
  | UFLOAT
  | INT
  | UINT
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
