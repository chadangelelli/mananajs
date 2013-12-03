spc            [\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]
void_tag       "%"("area"|"base"|"br"|"col"|"embed"|"hr"|"img"|"input"|"keygen"|"link"|"menuitem"|"meta"|"param"|"source"|"track"|"wbr")
tag            "%"[a-zA-Z][a-zA-Z0-9]*
tag_id         "#"[a-zA-Z][a-zA-Z0-9\-\.\:_]*
tag_class      "."\-?[_a-zA-Z]+[_a-zA-Z0-9\-]*(?=["."\s\n])
tag_data_attr  "*"[a-zA-Z][a-zA-Z0-9\-]*(?="=")
tag_attr       [a-zA-Z][a-zA-Z0-9\-_]*(?="=")
id             [a-zA-Z_][a-zA-Z0-9_]{0,254}

%s tag expr
%x fn

%%

{void_tag}                                                this.begin('tag'); return 'VOID_TAG';
{tag}                                                     this.begin('tag'); return 'TAG';
<tag>{tag_id}                                             return 'TAG_ID';
<tag>{tag_class}                                          return 'TAG_CLASS'
<tag>{tag_attr}                                           return 'TAG_ATTR';
<tag>{tag_data_attr}                                      return 'TAG_DATA_ATTR';
<tag>.+                                                   this.popState(); return ['END_TAG', 'TEXT'];
<tag>(?=\n)                                               this.popState(); return 'END_TAG';
                                                          
                                                          
":for"                                                    this.begin('expr'); return 'FOR';
":case"                                                   this.begin('expr'); return 'CASE';
":if"                                                     this.begin('expr'); return 'IF';
<expr>"in"                                                return 'IN';
<expr>":else"                                             return 'ELSE';
<expr>"@"?{id}                                            return 'ID';
<expr>(?=\n)                                              this.popState(); return 'END_EXPR';
                                                          
"@"[a-zA-Z_]*?[a-zA-Z0-9_]*?"("                           this.begin('fn'); return 'FN';
<fn>"."[a-zA-Z_]*?[a-zA-Z0-9_]*?"("                       return 'CHAINED_FN';
<fn>{id}                                                  return 'ID';
<fn>")"                                                   return 'END_FN';
                                                          
<expr,fn>","                                              return 'COMMA';
<expr,fn>"."                                              return 'DOT';
<expr,fn>["+""-"]?(0|[1-9][0-9]*)"."[0-9]+                return 'FLOAT'   ;
<expr,fn>["+""-"]?(0|[1-9][0-9]*)                         return 'INT'     ;
<expr,fn>(0|[1-9][0-9]*)"."[0-9]+                         return 'UFLOAT'  ;
<expr,fn>(0|[1-9][0-9]*)                                  return 'UINT'    ;
<expr,fn>"true"|"false"                                   return 'BOOL'    ;
<expr,fn>"null"                                           return 'NULL'    ;
<expr,fn>("'"("\\'"|[^"'"])*"'")|('"'('\\"'|[^'"'])*'"')  return 'STRING';
<expr,fn>{spc}                                            /* ignore */

<INITIAL>.+                                               return 'TEXT';
                                                          
<<EOF>>                                                   return 'EOF';

<INITIAL>\s*<<EOF>> %{
  var tokens = [];
  while (0 < _indent_stack[0]) {
    this.popState();
    tokens.unshift("DEDENT");
    _indent_stack.shift();
  }
  if (tokens.length) return tokens;
%}

[\n\r]+{spc}*/![^\n\r]    /* eat blank lines */

<INITIAL>[\n\r]{spc}* %{
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
