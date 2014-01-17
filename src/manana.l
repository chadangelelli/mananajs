
spc [\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]

void_tag ("area"|"base"|"br"|"col"|"embed"|"hr"|"img"|"input"|"keygen"|"link"|"menuitem"|"meta"|"param"|"source"|"track"|"wbr")

tag_id         "#"[a-zA-Z][a-zA-Z0-9\-\:_]*
tag_class      "."\-?[_a-zA-Z]+[_a-zA-Z0-9\-]*(?=["."\s\n])
tag_data_attr  "*"[a-zA-Z][a-zA-Z0-9\-]*(?="=")
tag_attr       [a-zA-Z][a-zA-Z0-9\-_]*(?="=")

word           (?!"${")[^\s\n][^\s\n]*
id             [a-zA-Z_][a-zA-Z0-9_]{0,254}
string         ("'"("\\'"|[^"'"])*"'")|('"'('\\"'|[^'"'])*'"')

%s comment tag tagargs filter expr name

%{ 
  function strip(start, end) {
    return yytext = yytext.substr(start, yyleng-end);
  }
%}

%%

<INITIAL>'"""'                        this.pushState("comment"); /* ignore */ 
<comment>'"""'                        this.popState(); /* ignore */ 
<comment>.+                           /* ignore */
<comment>\n                           /* ignore */
                                      
<INITIAL>{id}                         this.pushState("tag"); return "TAG";
<INITIAL>{void_tag}                   this.pushState("tag"); yytext = yytext.slice(1); return "VOID_TAG";
<tag>(?=\n)                           this.popState(); return "END_TAG";
<tag>{tag_id}                         yytext = yytext.slice(1); return "TAG_ID";
<tag>{tag_class}                      yytext = yytext.slice(1); return "TAG_CLASS";
<tag>"("                              this.pushState("tagargs"); return "LPAREN";
<tagargs>")"                          this.popState(); return "RPAREN";
<tagargs>\s                           /* ignore */
<tagargs>\n                           /* ignore */
<tagargs>"="                          return "EQ";
<tagargs>","                          return "COMMA";
<tagargs>{tag_attr}                   return "TAG_ATTR";
<tagargs>{tag_data_attr}              yytext = "data-" + yytext.slice(1); return "TAG_DATA_ATTR";
<tagargs>{string}                     yytext = strip(1,2).replace(/\\"/g, '"'); return "STRING";
                                      
<INITIAL>":"{id}                      this.pushState("filter"); yytext = yytext.slice(1); return "FILTER";
                                      
<INITIAL>"%for"                       this.pushState("expr"); return "FOR";
<INITIAL>"%if"                        this.pushState("expr"); return "IF";
<INITIAL>"%else"                      this.pushState("expr"); return "ELSE";
<expr>(?=\n)                          this.popState(); return "END_EXPR";
<expr>"in"                            return "IN";
<expr>"["                             return "LBRACK";
<expr>"]"                             return "RBRACK";
<expr>","                             return "COMMA";
<expr>":"                             return "COLON";
<expr>{id}                            return "ID";
                                      
<INITIAL,tag>"@{"                     this.pushState("name"); return "LBRACE";
<name>"}"                             this.popState(); return "RBRACE"
<name>{id}                            return "ID";
<name>"."                             return "DOT";
                                      
<expr,name>("+"|"-")?(0|[1-9][0-9]*)  return "INT";
<INITIAL,tag,filter,expr>{word}       return "WORD";
                                      
<<EOF>>                               return 'EOF';

<INITIAL,filter>\s*<<EOF>> 
%{
  var tokens = [];
  while (0 < _indent_stack[0]) {
    this.popState();
    tokens.unshift("DEDENT");
    _indent_stack.shift();
  }
  if (tokens.length) return tokens;
%}

[\n\r]+{spc}*/![^\n\r]    /* eat blank lines */

<INITIAL,filter>[\n\r]{spc}* 
%{
  var indentation = yytext.length - yytext.search(/\s/) - 1;
  if (indentation > _indent_stack[0]) {
    _indent_stack.unshift(indentation);
    return 'INDENT';
  }
  var tokens = [];
  while (indentation < _indent_stack[0]) {
    this.popState();
    tokens.unshift("DEDENT");
    _indent_stack.shift();
  }
  if (tokens.length) return tokens;
%}

{spc}+ /* ignore all other whitespace */

%%

_indent_stack = [0];
