
spc            [\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]
void_tag       "%"("area"|"base"|"br"|"col"|"embed"|"hr"|"img"|"input"|"keygen"|"link"|"menuitem"|"meta"|"param"|"source"|"track"|"wbr")
tag            "%"[a-zA-Z][a-zA-Z0-9]*
variable       "@"[a-zA-Z_][0-9a-zA-Z_]{0,254}
html_id        "#"[a-zA-Z][a-zA-Z0-9\-\.\:_]* 
html_class     "."\-?[_a-zA-Z]+[_a-zA-Z0-9\-]*
html_data_attr "*"[a-zA-Z][a-zA-Z0-9\-]*       
keyword        ":"("for"|"switch"|"if")
indent         [\n\r]{spc}*

%s tag

%%

{void_tag}                                                      this.begin('tag'); return 'VOID_TAG';
{tag}                                                           this.begin('tag'); return 'TAG';
<tag>(?=\n)                                                     this.popState(); return 'END_TAG_DEF';
<tag>{html_id}                                                  return 'HTML_ID';
<tag>{html_class}                                               return 'HTML_CLASS'
<tag>{html_data_attr}                                           return 'HTML_DATA_ATTR';
<tag>[a-zA-Z][a-zA-Z0-9\-_]*                                    return 'NAME';

<INITIAL>{keyword}                                              return 'KEYWORD' ;
<INITIAL>{variable}                                             return 'VAR'     ;

("'"("\\'"|[^"'"])*"'")|('"'('\\"'|[^'"'])*'"')                 return 'STRING'  ;
(r[gim]*"'"("\\'"|[^"'"])*"'")|(r[gim]*'"'('\\"'|[^'"'])*'"')   return 'REGEX'   ;
[0-9a-fA-Z]{24}                                                 return 'HEX'     ;
["+""-"]?(0|[1-9][0-9]*)"."[0-9]+                               return 'FLOAT'   ;
["+""-"]?(0|[1-9][0-9]*)                                        return 'INT'     ;
(0|[1-9][0-9]*)"."[0-9]+                                        return 'UFLOAT'  ;
(0|[1-9][0-9]*)                                                 return 'UINT'    ;
"true"|"false"                                                  return 'BOOL'    ;
"null"                                                          return 'NULL'    ;
"//".+                                                          /* COMMENT */ 
<INITIAL>[^\s]+.+                                               return 'TEXT';
<<EOF>>                                                         return "ENDOFFILE";

<INITIAL>\s*<<EOF>> %{
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

[\n\r]+{spc}*/![^\n\r] /* eat blank lines */

<INITIAL>{indent} %{
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
  if (tokens.length) {
    return tokens;
  }
%}

{spc}+ /* ignore all other whitespace */

%%

_indent_stack = [0];
