voidtag ("area"|"base"|"br"|"col"|"embed"|"hr"|"img"|"input"|"keygen"|"link"|"menuitem"|"meta"|"param"|"source"|"track"|"wbr")
type    ("List"|"Hash"|"String"|"Boolean"|"Integer"|"Number")
op      ("=="|"!="|">="|"<="|">"|"<"|"%")
tag     [a-zA-Z][a-zA-Z0-9]*
spc     [ \t]
id      "$"?[a-zA-Z_][a-zA-Z0-9_]{0,254}
text    .+?(?=(\n|"@{"))

%s name filter raw

%%

/*-------------------------------indentation,whitespace*/
<INITIAL>\s*<<EOF>>
%{
  var tokens = [];
  while (0 < indent_stack[0]) {
    this.popState();
    tokens.unshift("DEDENT");
    indent_stack.shift();
  }

  if (tokens.length) {
    tokens.push("EOF");
    return tokens;
  } else {
    return "EOF";
  }
%}

<INITIAL,filter>[\n\r]+{spc}*/![^\n\r] // ignore blank lines

<INITIAL,raw>[\n\r]{spc}*
%{
  // Set level to length of string minus newline character.
  var level = yytext.length - 1; 

  // Pop state in case we're currently in "raw".
  this.popState();

  if (level > indent_stack[0]) {
    indent_stack.unshift(level);
    return "INDENT";
  }

  if (level < indent_stack[0]) {
    var tokens = [];
    while (level < indent_stack[0]) {
      tokens.unshift("DEDENT");
      indent_stack.shift();
    }
 
    if (tokens.length) {
      return tokens;
    }
  }
%}



/*-------------------------------tags*/
<INITIAL>{voidtag} return "VOIDTAG";
<INITIAL>{tag}     return "TAG";



/*-------------------------------names*/
<INITIAL,filter,raw>"@{"         this.pushState("name"); return "NSTART";
<name>"}"                        this.popState(); return "NSTOP";
<name>{id}                       return "ID";
<name>"."|"["|"]"|":"            return yytext;
<name>("+"|"-")?(0|[1-9][0-9]*)  return "INT";



/*-------------------------------functions*/



/*-------------------------------filters*/
<INITIAL>":"{id}
%{
  this.pushState("filter"); 
  yytext = yytext.slice(1); 
  return "FILTER";
%}

<filter>\s*<<EOF>>
%{
  this.popState();

  var tokens = [];
  while (filter_level >= indent_stack[0]) {
    tokens.unshift("DEDENT");
    indent_stack.shift();
  }

  filter_level = 0;

  tokens.shift();
  tokens.push("EOF");

  return tokens;
%}

<filter>[\n\r]{spc}*
%{
  var level, tokens;

  level = yytext.length - 1;

  /* Set lexer into Filter Mode. */
  if (filter_level === 0) {
    filter_level = level;
    indent_stack.unshift(level);
    return "INDENT";

  } 
  /* Set lexer back into Standard Mode. */
  else if (level < filter_level) {
    this.popState();
    filter_level = 0;

    tokens = [];
    while (indent_stack[0] > level) {
      tokens.push("DEDENT");
      indent_stack.shift();
    }

    return tokens;
  }
  /* Convert new line to a space for output. */
  else {
    yytext = ' ';
    return "TEXT";
  }
%}



/*-------------------------------comments*/
<INITIAL>[\n\r]*{spc}*'"""'(.|\n)*?'"""' // ignore comments
<INITIAL>[\n\r]*{spc}*"//"[^\n]*         // ignore comments



/*-------------------------------raw-text*/
<INITIAL>"~" this.pushState("raw"); return "RAW";



/*-------------------------------text*/
<INITIAL,filter,raw>{text} return "TEXT";



/*-------------------------------misc.*/
{spc}+ // ignore all other whitespace



%%

indent_stack = [0];
filter_level = 0;
code_indent_level = 0;
