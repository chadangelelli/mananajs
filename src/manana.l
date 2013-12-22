
spc            [\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]
void_tag       "%"("area"|"base"|"br"|"col"|"embed"|"hr"|"img"|"input"|"keygen"|"link"|"menuitem"|"meta"|"param"|"source"|"track"|"wbr")
tag            "%"[a-zA-Z][a-zA-Z0-9]*
tag_id         "#"[a-zA-Z][a-zA-Z0-9\-\.\:_]*
tag_class      "."\-?[_a-zA-Z]+[_a-zA-Z0-9\-]*(?=["."\s\n])
tag_data_attr  "*"[a-zA-Z][a-zA-Z0-9\-]*(?=":")
tag_attr       [a-zA-Z][a-zA-Z0-9\-_]*(?=":")
id             [a-zA-Z_][a-zA-Z0-9_]{0,254}
word           [^"@"":""%"\s\n][^\s\n]*
fn             "@"(?="(")
string         ("'"("\\'"|[^"'"])*"'")|('"'('\\"'|[^'"'])*'"')

%s tag text fn

%{ 
  function strip(start, end) {
    return yytext = yytext.substr(start, yyleng-end);
  }
%}

%%

<INITIAL>{tag} this.begin('tag'); return 'TAG';
<tag>(\n|"}")  this.begin("INITIAL"); return 'END_TAG';                                                   



<INITIAL,tag,text>{word} 
%{
  this.begin('text'); 
  if ('\\' == yytext[0]) { 
    yytext = yytext.slice(1); 
  }
  return 'WORD';
%}
<text>\n       this.begin("INITIAL"); return 'END_TEXT';
<text>(?={fn}) this.begin("INITIAL"); return 'END_TEXT';



<INITIAL,fn>{fn}      this.begin('fn'); return 'FN';
<fn>{id}              return 'ID';
<fn>"["(0|[0-9]+)"]"  yytext = strip(1,2); return 'INDEX';
<fn>"."               return 'DOT';
<fn>"("               return 'LPAREN';
<fn>")"(?=\s*")")     return 'RPAREN';
<fn>")"(?=\s|("."\s)) this.begin("INITIAL"); return 'RPAREN';


                            
<<EOF>>                     return 'EOF';

<INITIAL>\s*<<EOF>> 
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

<INITIAL>[\n\r]{spc}* 
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
