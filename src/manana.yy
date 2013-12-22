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
  | text
  | fn
	;

text
  : word_list END_TEXT { $$ = ['TEXT', $1.join(' ')]; }
  ; 

word_list
  : word_list WORD { $$ = $1; $$.push($2); }
  | WORD           { $$ = [$1]; }
  ;

fn
  : FN LPAREN fn_args RPAREN { $$ = ['FN', $1]; $$.push.apply($$, $3); }
  ;

fn_args
  : fn_args fn_arg { $$ = $1; $$.push($2); }
  | fn_arg         { $$ = [$1]; }
  ;

fn_arg
  : path
  | fn
  ;

path
  : path DOT ID { $$ = $1; $$.push($3); }
  | path INDEX  { $$ = $1; $$.push($2); }
  | ID          { $$ = ['PATH', $1]; }
  ;




