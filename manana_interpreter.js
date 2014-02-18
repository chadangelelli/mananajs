(function(exports) {
 
  // _____________________________________________ Error-handling
  function MananaError(message, loc) {
    this.name = "MananaError";
    this.message = message;
    this.loc = loc;
  } // end MananaError()

  // _____________________________________________ Validation shorthand 
  function isa(v, t) { return typeof v === t; }
  function isNull(v) { return v === null; }
  function isStr(v)  { return isa(v, "string"); }
  function isNum(v)  { return isa(v, "number"); }
  function isInt(v)  { return isa(v, "number") && parseFloat(v) == parseInt(v, 10) && ! isNaN(v); }
  function isArr(v)  { return Object.prototype.toString.call(v) === '[object Array]'; }
  function isObj(v)  { return Object.prototype.toString.call(v) === '[object Object]'; }

  // _____________________________________________ Extensions 
  String.prototype.intpol = function(o) {
    return this.replace(/{([^{}]*)}/g, function (a, b) { 
      var r = o[b]; return isStr(r) || isNum(r) ? r : a; 
    });
  };

  // _____________________________________________ Interpreter
  function MananaInterpreter() {
    var self = this;

    // ........................................... 
    this.code = '';
    this.ir = '';
    this.context = {};
    this.last_context = null;
    this.result = '';

    // ........................................... 
    if (typeof require !== "undefined") {
      this.Parser = require('./manana_parser');
      this.parser = this.Parser.parser;
      this.parse  = this.Parser.parse;
    } else {
      this.parser = manana_parser;
      this.Parser = manana_parser.Parser;
      this.parse  = manana_parser.parse;
    }

    // ...........................................  
    this.evalForm = function(form, context) {
      var res = '', i;
      if (isObj(form)) {
        res += this[form.type](form, context);
      } else if (isArr(form)) {
        i = 0;
        while (typeof form[i] !== "undefined") {
          res += this.evalForm(form[i], context);
          i++;
        }
      } else {
        res += form;
      }
      return res;
    }; // end MananaInterpreter.evalForm()

    // ...........................................  
    this.eval = function(code, context) {
      var i = 0, form;

      this.code = code;
      this.context = context || {};
      this.ir = this.parse(code);
      console.log(JSON.stringify(this.ir, null, 4));
      console.log("\n\n");
      console.log("-----------------------------------------------");
      console.log("\n\n");

      while (form = this.ir[i]) {
        this.result += this.evalForm(form, this.context);
        i++;
      }

      return this.result;
    }; // end MananaInterpreter.eval()

    // ...........................................  
    this.NameSpace = function(id, value, parent) {
      this.id = id;
      this.value = JSON.parse(JSON.stringify(value));
      this.parent = parent;
    }; // end MananaInterpreter.NameSpace()

    // ...........................................  
    this.Path = function(form, context) {
      var node = context, el;
      while (typeof node[el] !== "undefined") {
        console.log(node[el]);      
      }
      return node;
    }; // end MananaInterprteter.Path()

    // ...........................................  
    this.With = function(form, context) {
      // path, id, body, loc

      console.log("\t >> ", JSON.stringify(form, null, 4));
      console.log("\n\n");
      return form;
    }; // end MananaInterpreter.With()

    // ...........................................  
    this.Tag = function(form, context) {
      var html     = '<{tag}{attrs}>{body}</{tag}>', 
          attr_tpl = ' {key}="{val}"', 
          content  = { tag: form.tag, attrs: '', body: '' }, 
          i;

      if (isArr(form.attrs)) {
        i = 0;
        while (form.attrs[i]) {
          content.attrs += attr_tpl.intpol({ key: form.attrs[i][0], val: form.attrs[i][1] })
          i++; 
        }
      }

      if (isArr(form.body)) {
        i = 0;
        while (form.body[i]) {
          content.body += self.evalForm(form.body[i], context);
          i++;
        }
      }

      return html.intpol(content);
    }; // end MananaInterpreter.Tag()

    // ...........................................  
    this.Text = function(form, context) {
      console.log(form);
    }; // end MananaInterpreter.Text()

  } // end MananaInterpreter()

  // _____________________________________________ Make available in both node.js & browser 
  if (typeof window !== "undefined") {
    window.MananaInterpreter = MananaInterpreter;
  } else {
    exports.MananaInterpreter = MananaInterpreter;
  }

})(typeof exports === "undefined" ? this['manana'] = {} : exports);
