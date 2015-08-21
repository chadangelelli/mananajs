voidtag  "area"|"base"|"br"|"col"|"embed"|"hr"|"img"|"input"|"keygen"|"link"|"menuitem"|"meta"|"param"|"source"|"track"|"wbr"
type     "List"|"Hash"|"String"|"Boolean"|"Integer"|"Number"
expr     "for"|"if"|"elif"|"else"|"alias"|"unalias"|"with"|"include"|"case"|"when"
logop    "exists"|"not"|"and"|"or"|"in"|"is"|"as"
compop   "=="|"!="|">="|"<="|">"|"<"|"%"
tag      [a-zA-Z][a-zA-Z0-9]*
tagid    "#"[a-zA-Z][a-zA-Z0-9\-\:_]*
tagcls   "."\-?[_a-zA-Z]+[_a-zA-Z0-9\-]*
spc      [ \t]
id       "$"?[a-zA-Z_][a-zA-Z0-9_]{0,254}
alttext  \n|@\{|@\$?[a-zA-Z][a-zA-Z0-9]*\(
str      ('"'('\\"'|[^'"']|"'")*'"')|("'"("\\'"|[^"'"]|'"')*"'")
text     [^'@'].*?(?=\n|'@{'|'@'\$?[a-zA-Z][a-zA-Z0-9]*'(')

%s tag attrs name filter raw expr fn code

%%

/*-------------------------------comments*/
<INITIAL>[\n\r]*{spc}*'"""'(.|\n)*?'"""' // ignore comments
<INITIAL>[\n\r]*{spc}*"//"[^\n]*         // ignore comments



/*-------------------------------indentation,whitespace*/
<INITIAL,tag>{spc}*<<EOF>>
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

<tag,raw>(?=\n) this.popState();

<INITIAL,filter,raw>[\n\r]+{spc}*/![^\n\r] 
%{
  this.popState();
  //console.log("\n=============================================================");
  //console.log('<INITIAL,tag,filter,raw>[\\n\\r]+{spc}*/![^\\n\\r]');
  //console.log("\t<<<<<<<< BLANK LINE >>>>>>>>\n"); 
  //console.log("\tline: " + yylineno);
  //console.log("\tconditionStack: " + JSON.stringify(this.conditionStack));
  //console.log("\tindent_stack: " + JSON.stringify(indent_stack));
  // ignore blank lines
%}

<INITIAL,raw>[\n\r]{spc}*
%{
  // Set level to length of string minus newline character.
  var level = yytext.length - 1;

  //console.log("\n=============================================================");
  //console.log('<INITIAL,tag,raw>[\\n\\r]{spc}*');
  //console.log("\tline: " + yylineno);
  //console.log("\tlevel: " + level);
  //console.log("\n\t---current---");
  //console.log("\tconditionStack: " + JSON.stringify(this.conditionStack));
  //console.log("\tindent_stack: " + JSON.stringify(indent_stack));

  this.popState();

  if (level > indent_stack[0]) {
    indent_stack.unshift(level);
    //console.log("\n\t---changes---");
    //console.log("\tconditionStack: " + JSON.stringify(this.conditionStack));
    //console.log("\tindent_stack: " + JSON.stringify(indent_stack));
    //console.log("\n\treturn INDENT");
    return "INDENT";
  }

  if (level < indent_stack[0]) {
    var tokens = [];
    while (level < indent_stack[0]) {
      tokens.unshift("DEDENT");
      indent_stack.shift();
    }
 
    if (tokens.length) {
      //console.log("\treturn " + JSON.stringify(tokens));
      return tokens;
    }
  }
%}

<INITIAL>{spc}+
%{
  var level = yytext.length;

  if (level > indent_stack[0]) {
    indent_stack.unshift(level);
    //console.log("\n=============================================================");
    //console.log('<INITIAL>{spc}+');
    //console.log("\tline: " + yylineno);
    //console.log("\tconditionStack: " + JSON.stringify(this.conditionStack));
    //console.log("\tindent_stack: " + JSON.stringify(indent_stack));
    return "INDENT";
  }
%}



/*-------------------------------strings*/
<attrs,expr,fn,name>{str}  return "STR";
<attrs,expr,fn,name>i{str} return "ISTR";



/*-------------------------------expressions*/
<INITIAL>{expr}(?={spc}|\n) this.pushState("expr"); return yytext.toUpperCase();
<expr>{logop}(?={spc})      return yytext.toUpperCase();
<expr>{compop}              return "OP";
<expr,fn,name>true|false    return "BOOL";
<expr>{type}                return "TYPE";
<expr>(?=\n)                this.popState();



/*-------------------------------tags*/
<INITIAL>pre|code                 this.pushState("code"); return "CODETAG";
<INITIAL>{voidtag}                this.pushState("tag"); return "VOIDTAG";
<INITIAL>{tag}                    this.pushState("tag"); return "TAG";
<tag>{tagid}                      yytext = yytext.slice(1); return "TAGID";
<tag>{tagcls}                     yytext = yytext.slice(1); return "TAGCLASS";
<tag>"->"{spc}*({str}|i{str})     yytext = yytext.slice(2).trimLeft(); return "TAGSRC";
<tag>{spc}+                       // ignore whitespace
<tag>"("                          this.pushState("attrs"); return yytext;
<attrs>")"                        this.popState(); return yytext;
<attrs>[a-zA-Z][a-zA-Z0-9\-_]*    return "ATTR";
<attrs>"*"[a-zA-Z][a-zA-Z0-9\-]*  return "DATAATTR";
<attrs>"="                        return yytext;
<attrs>\n                         // ignore
<attrs>","                        // ignore
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
"@{"                                     this.pushState("name"); return "NSTART";
<name,expr,fn>{id}                       return "ID";
<name,expr,fn>"."|"["|"]"|":"            return yytext;
<name,expr,fn>("+"|"-")?(0|[1-9][0-9]*)  return "INT";
<name>","                                return "COMMA";
<name>"}"                                
%{
  // Pop "name" off conditions stack.
  this.popState(); 

  //console.log("\n=============================================================");
  //console.log('<name>"}"');
  //console.log("\tline: " + yylineno);
  //console.log("\n\t---current---");
  //console.log("\tconditionStack: " + JSON.stringify(this.conditionStack));
  //console.log("\tindent_stack: " + JSON.stringify(indent_stack));

  var cur_state = this.conditionStack[this.conditionStack.length-1];

  if (cur_state !== "raw" && cur_state !== "filter") {
    this.pushState("raw");
    //console.log("\n\t---changes---");
    //console.log("\tconditionStack: " + JSON.stringify(this.conditionStack));
    //console.log("\tindent_stack: " + JSON.stringify(indent_stack));
  }
  //console.log('\treturning: "NSTOP"');
  return "NSTOP";
%}



/*-------------------------------functions*/
"@"{id}"("   
%{
  this.pushState("fn"); 
  yytext = yytext.slice(1, -1); 
  return "FN";
%}
<fn>","  return "COMMA";
<fn>"="  return "EQ";
<fn>\s   /* ignore */
<fn>\n   /* ignore */
<fn>")"                                
%{
  // Pop "fn" off conditions stack.
  this.popState(); 

  //console.log("\n=============================================================");
  //console.log('<fn>")"');
  //console.log("\tline: " + yylineno);
  //console.log("\n\t---current---");
  //console.log("\tconditionStack: " + JSON.stringify(this.conditionStack));
  //console.log("\tindent_stack: " + JSON.stringify(indent_stack));

  var cur_state = this.conditionStack[this.conditionStack.length-1];

  if ( cur_state !== "name" && 
       cur_state !== "raw" && 
       cur_state !== "expr" &&
       cur_state !== "filter" )
  {
    this.pushState("raw");
    //console.log("\n\t---changes---");
    //console.log("\tconditionStack: " + JSON.stringify(this.conditionStack));
    //console.log("\tindent_stack: " + JSON.stringify(indent_stack));
  }

  //console.log('\treturning: "RPAREN"');
  return "RPAREN";
%}


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
    //console.log("--- INSERT SPACE IN FILTER ---");
    yytext = ' ';
    return "TEXT";
  }
%}



/*-------------------------------misc.*/
<INITIAL>"!"break     return "BREAK";
<INITIAL>"!"continue  return "CONTINUE";

<tag,attrs,name,filter,raw,expr,fn,code>{spc}+ // ignore all other whitespace



/*-------------------------------raw-text*/
<INITIAL>"~" this.pushState("raw"); return "RAW";



/*-------------------------------text*/
<INITIAL,filter,raw>{text}  return "TEXT";


%%

indent_stack = [0];
filter_level = 0;
code_level = 0;
