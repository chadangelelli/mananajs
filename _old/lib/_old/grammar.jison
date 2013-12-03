%start prog

%options flex
%ebnf

%% /* language grammar */

prog
	: proglist ENDOFFILE
	  %{ 
      console.log("\n\n ==>\n\n %j", $proglist); 
      console.log("\n\n ==>\n\n", $1);
    %}
	;

proglist
	: proglist stmt { $proglist.push($stmt); $$ = $proglist; }
	| stmt          { $$ = [$stmt]; }
	;

stmt
  : indent 
  | dedent
  | tag
  | text
	;

indent
  : INDENT { $$ = ['INDENT']; }
  ;

dedent
  : DEDENT { $$ = ['DEDENT']; }
  ;

tag
  : TAG                        { $$ = ['TAG', $1.slice(1)]; }
  | TAG END_TAG_DEF            { $$ = ['TAG', $1.slice(1)]; }
  | TAG attrs END_TAG_DEF      { $$ = ['TAG', $1.slice(1), $2]; }
  | TAG attrs
  | VOID_TAG                   { $$ = ['VOID_TAG', $1.slice(1)]; }
  | VOID_TAG END_TAG_DEF       { $$ = ['VOID_TAG', $1.slice(1)]; }
  | VOID_TAG attrs END_TAG_DEF { $$ = ['VOID_TAG', $1.slice(1), $2]; }
  ;

attrs
  : attrs attr { $$ = $1; $$.push($2); }
  | attr       { $$ = ['ATTRS', $1]; }
  ;

attr
  : HTML_ID                     { $$ = ['ID', $1.slice(1)]; }
  | HTML_CLASS                  { $$ = ['CLASS', $1.slice(1)]; }
  | HTML_DATA_ATTR EQ NAME      { $$ = ['DATA', $1.slice(1), $3]; }
  | HTML_DATA_ATTR EQ STRING    { $$ = ['DATA', $1.slice(1), $3.slice(1, $3.length-1)]; }
  | NAME EQ STRING              { $$ = ['ATTR', $1, $3.slice(1, $3.length-1)]; }
  | NAME EQ NAME                { $$ = ['ATTR', $1, $3]; }
  ;

text
  : TEXT { $$ = ['TEXT', $1]; }
  ;

