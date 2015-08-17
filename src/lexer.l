voidtag ("area"|"base"|"br"|"col"|"embed"|"hr"|"img"|"input"|"keygen"|"link"|"menuitem"|"meta"|"param"|"source"|"track"|"wbr")
type    ("List"|"Hash"|"String"|"Boolean"|"Integer"|"Number")
expr    ("for"|"if"|"elif"|"else"|"alias"|"unalias"|"with"|"include"|"case"|"when")
logop   ("exists"|"not"|"and"|"or"|"in"|"is"|"as")
compop  ("=="|"!="|">="|"<="|">"|"<"|"%")
tag     [a-zA-Z][a-zA-Z0-9]*
tagid   "#"[a-zA-Z][a-zA-Z0-9\-\:_]*
tagcls  "."\-?[_a-zA-Z]+[_a-zA-Z0-9\-]*
spc     [ \t]
id      "$"?[a-zA-Z_][a-zA-Z0-9_]{0,254}
text    .+?(?=(\n|"@{"))
str     ('"'('\\"'|[^'"']|"'")*'"')|("'"("\\'"|[^"'"]|'"')*"'")

%s tag attrs name filter raw expr fn code

%%

/*-------------------------------indentation,whitespace*/
<INITIAL,tag>\s*<<EOF>>
%{
  var tokens;

  this.popState();

  tokens = [];
  while (0 < indent_stack[0]) {
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

<INITIAL,tag,raw,expr>[\n\r]{spc}*
%{
  // Set level to length of string minus newline character.
  var level = yytext.length - 1; 

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



/*-------------------------------expressions*/
<INITIAL>{expr}           this.pushState("expr"); return yytext.toUpperCase();
<expr>{logop}             return yytext.toUpperCase();
<expr>{compop}            return "OP";
<expr,fn,name>true|false  return "BOOL";
<expr>{type}              return "TYPE";



/*-------------------------------tags*/
<INITIAL>{voidtag}                return "VOIDTAG";
<INITIAL>pre|code                 this.pushState("code"); return "CODETAG";
<INITIAL>{tag}                    this.pushState("tag"); return "TAG";
<INITIAL>{tagid}                  this.pushState("tag"); yytext = yytext.slice(1); return "TAGID";
<INITIAL>{tagcls}                 this.pushState("tag"); yytext = yytext.slice(1); return "TAGCLASS";
<tag>{tagid}                      yytext = yytext.slice(1); return "TAGID";
<tag>{tagcls}                     yytext = yytext.slice(1); return "TAGCLASS";
<tag>"->"{spc}*{str}              yytext = yytext.replace(/^->\s*/, ''); return "TAGSRC";
<tag>{spc}+                       // ignore whitespace
<tag>"("                          this.pushState("attrs"); return yytext;
<attrs>")"                        this.popState(); return yytext;
<attrs>[a-zA-Z][a-zA-Z0-9\-_]*    return "ATTR";
<attrs>"*"[a-zA-Z][a-zA-Z0-9\-]*  return "DATAATTR";
<attrs>"="                        return yytext;
<attrs>\n                         // ignore
<tag>{text}                       this.popState(); return "TEXT";


/*-------------------------------code*/
<code>\s*<<EOF>>
%{
  this.popState();

  var tokens = [];
  while (code_level >= indent_stack[0]) {
    tokens.unshift("DEDENT");
    indent_stack.shift();
  }

  code_level = 0;

  tokens.shift();
  tokens.push("EOF");

  return tokens;
%}

<code>[\n\r]+{spc}*/![^\n\r]  yytext = ''; return "BLANKLINE";

<code>[\n\r]{spc}*
%{
  // Set level to length of string minus newline character.
  var indent_level = yytext.length - 1; 

  if (code_level === 0) {
    code_level = indent_level;
    indent_stack.unshift(indent_level);
    yytext = yytext.slice(code_level + 1);
    return "INDENT";

  } else if (indent_level < code_level) {
    code_level = 0;

    var tokens = [];
    while (indent_level < indent_stack[0]) {
      tokens.unshift("DEDENT");
      indent_stack.shift();
    }

    this.popState();
    return tokens;

  } else if (code_level > 0) {
    yytext = yytext.slice(code_level + 1);
    return "INDENT";
  }
%}

<code>.*  return "LINE";



/*-------------------------------names*/
<INITIAL,filter,raw>"@{"                 this.pushState("name"); return "NSTART";
<name>"}"                                this.popState(); return "NSTOP";
<name,expr,fn>{id}                       return "ID";
<name,expr,fn>"."|"["|"]"|":"            return yytext;
<name,expr,fn>("+"|"-")?(0|[1-9][0-9]*)  return "INT";



/*-------------------------------functions*/
<INITIAL,expr,name>"@"{id}"("   %{
                                  this.pushState("fn"); 
                                  yytext = yytext.slice(1, -1); 
                                  return "FN";
                                %}
<fn>")"                         this.popState(); return "RPAREN";
<fn>","                         return "COMMA";
<fn>"="                         return "EQ";
<fn>\s                          /* ignore */
<fn>\n                          /* ignore */


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



/*-------------------------------strings*/
<attrs,expr,fn,name>{str}  return "STR";



/*-------------------------------raw-text*/
<INITIAL>"~" this.pushState("raw"); return "RAW";



/*-------------------------------text*/
<INITIAL,filter,raw>{text}  return "TEXT";



/*-------------------------------misc.*/
{spc}+ // ignore all other whitespace
<INITIAL>"!"break     return "BREAK";
<INITIAL>"!"continue  return "CONTINUE";



%%

indent_stack = [0];
filter_level = 0;
code_level = 0;
