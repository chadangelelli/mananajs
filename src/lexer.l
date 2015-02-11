
spc [\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]

void_tag ("area"|"base"|"br"|"col"|"embed"|"hr"|"img"|"input"|"keygen"|"link"|"menuitem"|"meta"|"param"|"source"|"track"|"wbr")

tag_id         "#"[a-zA-Z][a-zA-Z0-9\-\:_]*
tag_class      "."\-?[_a-zA-Z]+[_a-zA-Z0-9\-]*(?=["."\s\n])
tag_data_attr  "*"[a-zA-Z][a-zA-Z0-9\-]*(?=["="":"])
tag_attr       [a-zA-Z][a-zA-Z0-9\-_]*(?=\s*["="":"])

word           [^\s\n"@"][^\s\n]*
id             "$"?[a-zA-Z_][a-zA-Z0-9_]{0,254}
string         ("'"("\\'"|[^"'"]|'"')*"'")|('"'('\\"'|[^'"']|"'")*'"')
i_string_s     "i'"(?=.*?"@{")
i_string_d     'i"'(?=.*?"@{")
i_html         "<"(?=.*?"@{")

%s tag tagargs filter expr name fn i_string_d i_string_s i_html code_tag code

%{
  function strip(start, end) {
    return yytext = yytext.substr(start, yyleng-end);
  }
%}

%%

<INITIAL>[\n\r]*{spc}*'"""'(.|\n)*?'"""'  /* ignore comments */

<INITIAL>for                             this.pushState("expr"); return "FOR";
<INITIAL>if                              this.pushState("expr"); return "IF";
<INITIAL>elif                            this.pushState("expr"); return "ELIF";
<INITIAL>else                            this.pushState("expr"); return "ELSE";
<INITIAL>alias                           this.pushState("expr"); return "ALIAS";
<INITIAL>with                            this.pushState("expr"); return "WITH";
<INITIAL>include                         this.pushState("expr"); return "INCLUDE";

<INITIAL>"!"break                        return "BREAK";
<INITIAL>"!"continue                     return "CONTINUE";
                                         
<expr,fn>true                            return "BOOL";
<expr,fn>false                           return "BOOL";
<expr>(?=\n)                             this.popState(); return "END_EXPR";
<expr>and                                return "AND";
<expr>or                                 return "OR";
<expr>in                                 return "IN";
<expr>is                                 return "IS";
<expr>as                                 return "AS";
<expr>not                                return "NOT";
<expr>Hash                               return "TYPE";
<expr>List                               return "TYPE";
<expr>String                             return "TYPE";
<expr>Integer                            return "TYPE";
<expr>Number                             return "TYPE";
<expr>Boolean                            return "TYPE";
<expr>"=="                               return "COND";
<expr>"!="                               return "COND";
<expr>">="                               return "COND";
<expr>"<="                               return "COND";
<expr>"="                                return "COND";
<expr>">"                                return "COND";
<expr>"<"                                return "COND";
<expr>"%"                                return "COND";
<expr>exists                             return "EXISTS";
                                       
<INITIAL>{void_tag}                      this.pushState("tag");      return "VOID_TAG";
<INITIAL>pre|code                        this.pushState("code_tag"); return "CODE_TAG";
<INITIAL>{id}                            this.pushState("tag");      return "TAG";
<tag>(?=\n)                              this.popState();            return "END_TAG";
<tag,code_tag>{tag_id}                   yytext = yytext.slice(1);   return "TAG_ID";
<tag,code_tag>{tag_class}                yytext = yytext.slice(1);   return "TAG_CLASS";

<code_tag>(?=\n)                         this.popState(); this.pushState("code"); return "END_CODE_TAG";


<tag>"->"\s*{string}                     %{
                                            yytext = yytext.replace("->", '');
                                            yytext = yytext.replace(/\s*/, '')
                                            yytext = yytext.slice(1, -1)
                                            return "TAG_SRC";
                                         %}

<tag>"->"\s*{i_string_d}                 this.pushState("i_string_d"); return ["TAG_SRC_I_STRING", "I_STRING_D"];
<expr,name,tagargs,fn>{i_string_d}       this.pushState("i_string_d"); return "I_STRING_D";
<INITIAL,tag,filter>{i_string_d}         this.pushState("i_string_d"); return "I_STRING_D";                                      
<i_string_d>"@{"                         this.pushState("name");       return "START_NAME";
<i_string_d>'"'                          this.popState();              return "END_I_STRING_D";
<i_string_d>[^"@"'"']*                   return "I_STRING_TEXT";

<tag>"->"\s*{i_string_s}                 this.pushState("i_string_s"); return ["TAG_SRC_I_STRING", "I_STRING_S"];
<expr,name,tagargs,fn>{i_string_s}       this.pushState("i_string_s"); return "I_STRING_S";
<INITIAL,tag,filter>{i_string_s}         this.pushState("i_string_s"); return "I_STRING_S";                                      
<i_string_s>"@{"                         this.pushState("name");       return "START_NAME";
<i_string_s>"'"                          this.popState();              return "END_I_STRING_S"; // "
<i_string_s>[^"@""'"]*                   return "I_STRING_TEXT";

<INITIAL>{i_html}                        this.pushState("i_html"); return "I_HTML_START";
<i_html>"@{"                             this.pushState("name");   return "START_NAME";
<i_html>">"(?=\s*\n)                     this.popState();          return "I_HTML_END";
<i_html>.                                return "I_HTML_TEXT";
<INITIAL>"<".*(?=\n)                     return "HTML";

<tag>"("                                 this.pushState("tagargs"); return "LPAREN";
<tagargs>")"                             this.popState();           return "RPAREN";
<tag>"{"                                 this.pushState("tagargs"); return "LBRACE";
<tagargs>"}"                             this.popState();           return "RBRACE";
<tagargs>":"                             return "COLON";
<tagargs>"="                             return "EQ";
<tagargs>","                             return "COMMA";
<tagargs>{tag_attr}                      return "TAG_ATTR";
<tagargs>{tag_data_attr}                 yytext = "data-" + yytext.slice(1); return "TAG_DATA_ATTR";
<tagargs>\s                              /* ignore */
<tagargs>\n                              /* ignore */

<INITIAL>":"{id}                         this.pushState("filter"); yytext = yytext.slice(1); return "FILTER";

<INITIAL,tag,filter>"@{"                 this.pushState("name"); return "START_NAME";

<name>"}"                                this.popState(); return "RBRACE"
                                         
<INITIAL,tag,expr>"@"{id}\s?(?="(")      this.pushState("fn"); yytext = yytext.slice(1); return "FN";
<fn>")"(?!")")                           this.popState(); return "RPAREN";
<fn>\s                                   /* ignore */
<fn>\n                                   /* ignore */
<fn>"{"                                  return "LBRACE";
<fn>"}"                                  return "RBRACE";
<fn>","                                  return "COMMA";
<fn>"="                                  return "EQ";
                                         
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
<INITIAL,tag,filter>{string}             return "STRING"; // Do not strip quotes

<INITIAL,tag,filter>{word}               return "WORD";

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

<INITIAL,tag,tagargs,filter,fn,i_html>[\n\r]+{spc}*/![^\n\r]    /* eat blank lines */

<INITIAL>[\n\r]{spc}* 
%{
  var indentation = yytext.length - yytext.search(/\s/) - 1;

  if (indentation > indent_stack[0]) {
    indent_stack.unshift(indentation);
    return "INDENT";
  }

  var tokens = [];
  while (indentation < indent_stack[0]) {
    this.popState();
    tokens.unshift("DEDENT");
    indent_stack.shift();
  }

  if (tokens.length) {
    return tokens;
  }
%}

<code>\s*<<EOF>>
%{
  this.popState();

  var tokens = [];
  while (code_indent_level >= indent_stack[0]) {
    tokens.unshift("DEDENT");
    indent_stack.shift();
  }

  code_indent_level = 0;

  tokens.shift();
  tokens.push("EOF");

  return tokens;
%}

<code>[\n\r]+{spc}*/![^\n\r]  yytext = ''; return "BLANK_LINE";

<code>[\n\r]{spc}* 
%{
  var indent_level = yytext.length - yytext.search(/\s/) - 1;

  if (code_indent_level === 0) {
    code_indent_level = indent_level;
    indent_stack.unshift(indent_level);
    yytext = yytext.slice(code_indent_level + 1);
    return "INDENT";

  } else if (indent_level < code_indent_level) {
    code_indent_level = 0;

    var tokens = [];
    while (indent_level < indent_stack[0]) {
      tokens.unshift("DEDENT");
      indent_stack.shift();
    }

    this.popState();
    return tokens;

  } else if (code_indent_level > 0) {
    yytext = yytext.slice(code_indent_level + 1);
    return "INDENT";
  }
%}

<code>.*  return "LINE";

<filter>\s*<<EOF>>
%{
  this.popState();

  var tokens = [];
  while (filter_indent_level >= indent_stack[0]) {
    tokens.unshift("DEDENT");
    indent_stack.shift();
  }

  filter_indent_level = 0;

  tokens.shift();
  tokens.push("EOF");

  return tokens;
%}

<filter>[\n\r]{spc}* 
%{
  var indent_level, tokens;
    
  indent_level = yytext.length - yytext.search(/\s/) - 1;

  if (filter_indent_level === 0) {
    filter_indent_level = indent_level;
    indent_stack.unshift(indent_level);
    return "INDENT";

  } else if (indent_level < filter_indent_level) {
    this.popState();
    filter_indent_level = 0;
    
    tokens = [];
    while (indent_stack[0] > indent_level) {
      tokens.push("DEDENT");
      indent_stack.shift();
    }

    return tokens;
  }
%}

{spc}+ /* ignore all other whitespace */

%%

indent_stack = [0];
filter_indent_level = 0;
code_indent_level = 0;
