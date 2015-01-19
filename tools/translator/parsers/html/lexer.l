
spc     [\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]
string  ("'"("\\'"|[^"'"]|'"')*"'")|('"'('\\"'|[^'"']|"'")*'"')

%s tag

%%

<INITIAL>"<!--"(\n|.)*?"-->"                    return "COMMENT";
<INITIAL>"<"[a-zA-Z][a-zA-Z0-9]*(?=\s)          this.pushState("tag"); yytext = yytext.slice(1); return "TAG";
<INITIAL>"<"[a-zA-Z][a-zA-Z0-9]*(?=\s*">")      this.pushState("tag"); yytext = yytext.slice(1); return "TAG";
<tag>{string}                                   yytext = yytext.slice(1, -1); return "STRING";
<tag>data"-"[a-zA-Z\-]+(?="=")                  return "DATAATTR";
<tag>aria"-"[a-zA-Z\-]+(?="=")                  return "ATTR";
<tag>[a-zA-Z]+(?="=")                           return "ATTR";
<tag>"="                                        return "EQ";
<tag>{spc}+                                     /* ignore spaces */
<tag>">"                                        this.popState(); return "TAGEND";
<tag>"/>"                                       this.popState(); return "TAGEND";
<INITIAL>"<"\s*"/"\s*[a-zA-Z][a-zA-Z0-9]*">"    yytext = yytext.replace(/[</> ]/g, ''); return "CLOSETAG";
<INITIAL>[\r\n]{spc}*                           /* ignore lines--rejoin in interpreter */
<INITIAL>[^<>]+                                 return "TEXT";
<<EOF>>                                         return "EOF";
