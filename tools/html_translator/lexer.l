spc [\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]

%s html logic

%%

<INITIAL>[\n\r]*{spc}*'"""'(.|\n)*?'"""'  /* ignore comments */

<INITIAL>"<!--".*?"-->"  return "COMMENT";
<INITIAL><[a-zA-Z]       return "TAG";
