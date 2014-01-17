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
  | for_stmt
	;

tag_stmt
  : tag END_TAG                 { $$ = $1; }
  | tag text END_TAG            { $$ = $1; $$.push($2); }
  | tag END_TAG block           { $$ = $1; $$.push($3); }
  | tag tag_attrs END_TAG       { $$ = $1; $$[1].push.apply($$[1], $2); }
  | tag tag_attrs text END_TAG  { $$ = $1; $$[1].push.apply($$[1], $2); $$.push($3); }
  | tag tag_attrs END_TAG block { $$ = $1; $$[1].push.apply($$[1], $2); $$.push($4); }
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
  : FILTER INDENT text DEDENT { $$ = ['FILTER', $1, $3]; }
  ;

text
  : word_list %{ 
      var t = ['TEXT'], w = $1, i = 0, s = '';
      while (w[i]) {
        if (typeof w[i] === "string") {
          s += w[i] + ' ';
        } else {
          t.push(s);
          t.push(w[i]);
          s = '';
        }
        i++;
      }
      if (s) {
        t.push(s);
      }
      $$ = t;
    %}
  ; 

word_list
  : word_list word { $$ = $1; $$.push($2); }
  | word           { $$ = [$1]; }
  ;

word
  : WORD
  | name
  ;

for_stmt
  : FOR ID IN path END_EXPR block                   { $$ = ['FOR', $2, $4, $6]; }
  | FOR ID COMMA ID IN path END_EXPR block          { $$ = ['FOR', $2, $4, $6, $8]; }
  | FOR ID COMMA ID COMMA ID IN path END_EXPR block { $$ = ['FOR', $2, $4, $6, $8, $10]; }
  ;

path
  : path DOT id { $$ = $1; $$.push($3); }
  | id          { $$ = ['NAME', $1]; }
  ;

id 
  : ID                             { $$ = $1; }
  | ID LBRACK INT RBRACK           { $$ = [$1, $3]; }
  | ID LBRACK INT COLON INT RBRACK { $$ = [$1, $3, $5]; }
  ;

name
  : LBRACE path RBRACE { $$ = $2; }
  ;

