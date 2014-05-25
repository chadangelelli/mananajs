
spc [\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]

void_tag ("area"|"base"|"br"|"col"|"embed"|"hr"|"img"|"input"|"keygen"|"link"|"menuitem"|"meta"|"param"|"source"|"track"|"wbr")

tag_id         "#"[a-zA-Z][a-zA-Z0-9\-\:_]*
tag_class      "."\-?[_a-zA-Z]+[_a-zA-Z0-9\-]*(?=["."\s\n])
tag_data_attr  "*"[a-zA-Z][a-zA-Z0-9\-]*(?="=")
tag_attr       [a-zA-Z][a-zA-Z0-9\-_]*(?=\s*"=")

word           [^\s\n"@"][^\s\n]*
id             "$"?[a-zA-Z_][a-zA-Z0-9_]{0,254}
string         ("'"("\\'"|[^"'"])*"'")|('"'('\\"'|[^'"'])*'"')

%s comment tag tagargs filter expr name fn

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
                                      
<INITIAL>"<".+(?=\n)                     return 'HTML';
<INITIAL>for                             this.pushState("expr"); return "FOR";
<INITIAL>if                              this.pushState("expr"); return "IF";
<INITIAL>else                            this.pushState("expr"); return "ELSE";
<INITIAL>alias                           this.pushState("expr"); return "ALIAS";
<INITIAL>with                            this.pushState("expr"); return "WITH";
<INITIAL>include                         this.pushState("expr"); return "INCLUDE";
                                         
<expr,fn>true                            return "BOOL";
<expr,fn>false                           return "BOOL";
<expr>(?=\n)                             this.popState(); return "END_EXPR";
<expr>in                                 return "IN";
<expr>is                                 return "IS";
<expr>as                                 return "AS";
<expr>not                                return "NOT";
<expr>Hash                               return "TYPE";
<expr>List                               return "TYPE";
<expr>String                             return "TYPE";
<expr>Integer                            return "TYPE";
<expr>Number                             return "TYPE";
<expr>"=="                               return "COND";
<expr>"!="                               return "COND";
<expr>">="                               return "COND";
<expr>"<="                               return "COND";
<expr>"="                                return "COND";
<expr>">"                                return "COND";
<expr>"<"                                return "COND";
<expr>"%"                                return "COND";
<expr>exists                             return "EXISTS";
                                         
<INITIAL>{void_tag}                      this.pushState("tag"); return "VOID_TAG";
<INITIAL>{id}                            this.pushState("tag"); return "TAG";
<tag>(?=\n)                              this.popState(); return "END_TAG";
<tag>{tag_id}                            yytext = yytext.slice(1); return "TAG_ID";
<tag>{tag_class}                         yytext = yytext.slice(1); return "TAG_CLASS";
<tag>"("                                 this.pushState("tagargs"); return "LPAREN";
<tagargs>")"                             this.popState(); return "RPAREN";
<tagargs>\s                              /* ignore */
<tagargs>\n                              /* ignore */
<tagargs>"="                             return "EQ";
<tagargs>","                             return "COMMA";
<tagargs>{tag_attr}                      return "TAG_ATTR";
<tagargs>{tag_data_attr}                 yytext = "data-" + yytext.slice(1); return "TAG_DATA_ATTR";
                                         
<INITIAL>":"{id}                         this.pushState("filter"); yytext = yytext.slice(1); return "FILTER";
                                         
<INITIAL,tag,filter>"@{"                 this.pushState("name"); return "START_NAME";
<name>"}"                                this.popState(); return "RBRACE"
                                         
<INITIAL>"@"{id}\s?(?="(")               this.pushState("fn"); yytext = yytext.slice(1); return "FN";
<fn>")"(?!")")                           this.popState(); return "RPAREN";
<fn>\s                                   /* ignore */
<fn>\n                                   /* ignore */
<fn>"{"                                  return "LBRACE";
<fn>"}"                                  return "RBRACE";
<fn>","                                  return "COMMA";
                                         
<expr,name,fn>{id}                       return "ID";
<expr,name,fn>"."                        return "DOT";
<expr,name,fn>"("                        return "LPAREN";
<expr,name,fn>")"                        return "RPAREN";
<expr,name,fn>"["                        return "LBRACK";
<expr,name,fn>"]"                        return "RBRACK";
<expr,name,fn>":"                        return "COLON"; 
<expr,name,fn>","                        return "COMMA";
<expr,name,fn>("+"|"-")?(0|[1-9][0-9]*)  return "INT";

<expr,name,tagargs,fn>{string}           yytext = strip(1,2).replace(/\\"/g, '"'); return "STRING";
<INITIAL,tag>{string}                    return "STRING"; // Do not strip quotes
                                      
<INITIAL,tag,filter>{word}               return "WORD";
                                      
<<EOF>>                                  return 'EOF';

<INITIAL>\s*<<EOF>>
%{
  var tokens = [];
  while (0 < _indent_stack[0]) {
    this.popState();
    tokens.unshift("DEDENT");
    _indent_stack.shift();
  }
  if (tokens.length) {
    return tokens;
  }
%}

<filter>\s*<<EOF>>
%{
  var tokens = [];
  while (_filter_indent_level >= _indent_stack[0]) {
    this.popState();
    tokens.unshift("DEDENT");
    _indent_stack.shift();
  }
  if (tokens.length) {
    return tokens;
  }
%}


[\n\r]+{spc}*/![^\n\r]    /* eat blank lines */

<INITIAL>[\n\r]{spc}* 
%{
  var indentation = yytext.length - yytext.search(/\s/) - 1;
  if (indentation > _indent_stack[0]) {
    _indent_stack.unshift(indentation);
    return "INDENT";
  }
  var tokens = [];
  while (indentation < _indent_stack[0]) {
    this.popState();
    tokens.unshift("DEDENT");
    _indent_stack.shift();
  }
  if (tokens.length) return tokens;
%}

<filter>[\n\r]{spc}* 
%{
  var indentation = yytext.length - yytext.search(/\s/) - 1;

  if (typeof _filter_indent_level === "undefined") {
    _filter_indent_level = indentation;
    return "FILTER_START";
  } else if (indentation < _filter_indent_level) {
    _filter_indent_level = undefined;
    this.popState();
    return "DEDENT";
  } 
  /* else ignore */
%}

{spc}+ /* ignore all other whitespace */

%%

_indent_stack = [0];
_filter_indent_level = undefined;
