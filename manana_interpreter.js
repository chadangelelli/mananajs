(function(exports) {
 
  // _____________________________________________ Error-handling
  function MananaError(message, loc) {
    this.name = "MananaError";
    this.message = message;
    this.loc = loc;
  } // end MananaError()

  // _____________________________________________ Validation shorthand 
  function is(v, t) { return typeof v === t; }
  function isNull(v) { return v === null; }
  function isStr(v)  { return is(v, "string"); }
  function isNum(v)  { return is(v, "number"); }
  function isInt(v)  { return is(v, "number") && parseFloat(v) == parseInt(v, 10) && ! isNaN(v); }
  function isArr(v)  { return Object.prototype.toString.call(v) === '[object Array]'; }
  function isObj(v)  { return Object.prototype.toString.call(v) === '[object Object]'; }

  // _____________________________________________ Extensions 
  String.prototype.intpol = function(o) {
    return this.replace(/{([^{}]*)}/g, function (a, b) { 
      var r = o[b]; return isStr(r) || isNum(r) ? r : a; 
    });
  };

  function jd(v) {
    console.log(JSON.stringify(v, null, 4));
  }

  // _____________________________________________ Namespaces
  MananaNamespace = function(value, parent) {
    this.__value = JSON.parse(JSON.stringify(value));
    this.__parent = parent;
  }; // end MananaNamespace()

  // _____________________________________________ Interpreter
  function MananaInterpreter() {
    var self = this;

    // ........................................... 
    this.code = '';
    this.ir = '';
    this.context = {};
    this.namespace = {};
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
      this.ir = this.parse(code);

      this.namespace.original_context = new MananaNamespace(context, null);
      this.context = context || {};

      while (form = this.ir[i]) {
        this.result += this.evalForm(form, this.namespace.original_context);
        i++;
      }

      console.log("\n\n\nRESULT:\n" + JSON.stringify(this.result, null, 4) + "\n\n");
      return this.result;
    }; // end MananaInterpreter.eval()

    // ...........................................  
    this.Path = function(form, context) {
      var node, el, i, key, ctx;

      key = form.components[0][0];
      if ('__value' in context && '__parent' in context) {
        ctx = context.__value;
      } else if (key in context && '__value' in context[key] && '__parent' in context[key]) {
        ctx = context[key].__value;
      } else {
        throw new MananaError("Invalid context in path '{c}'".intpol({c:JSON.stringify(context)}), form.loc);
      }

      node = ctx;
      for (i in form.components) {
        el = form.components[i];
        if (el.length == 1) {
          if ( ! is(node[el[0]], "undefined")) {
            node = node[el[0]];
          }
        } else {
        }
      }

      return node;
    }; // end MananaInterprteter.Path()

    // ........................................... 
    this.With = function(form, context) {
    }; // end MananaInterpreter.With()

    // ...........................................  
    this.Tag = function(form, context) {
      var html, attr_tpl, content, i;

      html = '<{tag}{attrs}>{body}</{tag}>';
      attr_tpl = ' {key}="{val}"';
      content = { tag: form.tag, attrs: '', body: '' };

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
    this.For = function(form, context) {
      var key, i, res;

      self.context = self.Path(form.path, context);

      res = '';
      for (key in self.context) {
        self.namespace[form.id] = new MananaNamespace(self.context[key], self.context);
        for (i in form.body) {
          res += self.evalForm(form.body[i], self.namespace);
        }
      }
      delete self.namespace[form.id];
      
      return res;
    }; // end MananaInterpreter.For()

    // ...........................................  
    this.Text = function(form, context) {
      var i = 0, res = '', el;
      while ( ! is(form.body[i], "undefined")) {
        res += self.evalForm(form.body[i], context);
        i++;
      }
      return res;
    }; // end MananaInterpreter.Text()

  } // end MananaInterpreter()

  // _____________________________________________ Make available in both node.js & browser 
  if (typeof window !== "undefined") {
    window.MananaInterpreter = MananaInterpreter;
  } else {
    exports.MananaInterpreter = MananaInterpreter;
  }

})(typeof exports === "undefined" ? this['manana'] = {} : exports);
