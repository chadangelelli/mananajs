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
        return form;
      }
      return res;
    }; // end MananaInterpreter.evalForm()

    // ...........................................  
    this.eval = function(code, context) {
      var i = 0, form;

      self.code = code;
      self.ir = this.parse(code);

      self.namespace.original_context = new MananaNamespace(context, null);
      self.context = context || {};

      while (form = self.ir[i]) {
        self.result += self.evalForm(form, self.namespace.original_context);
        i++;
      }

      console.log("\n\n\nRESULT:\n" + JSON.stringify(this.result, null, 4) + "\n\n");
      return this.result;
    }; // end MananaInterpreter.eval()

    // ...........................................  
    this.Path = function(form, context) {
      var node, el, i, key, start, end;

      node = context;
      for (i in form.components) {
        el = form.components[i];

        if ('__value' in node && '__parent' in node) {
          node = node.__value;
        }

        if (is(node[el[0]], "undefined")) {
          throw new MananaError("Invalid path element '{e}' in path:\n\tCOMPONENTS: {p}\n\tCURRENT NODE: {n}".intpol({
                                  e: el[0], 
                                  p: JSON.stringify(form.components),
                                  n: JSON.stringify(node)
                               }));
        }

        if (el.length == 1) { // is Object ref
          node = node[el[0]].__value || node[el[0]];
        } else { // is Array slice
          if ( ! isArr(node[el[0]])) {
            throw new MananaError("Object at '{e}' is not an Array".intpol({e:el[0]}));
          }
          start = el[1];
          if (el.length == 2) {
            end = parseInt(el[1]) + 1;
          } else { // length > 2
            if (el[2] == '*') {
              end = node[el[0]].length;
            } else {
              end = parseInt(el[2]) + 1;
            }
          }
          node = node[el[0]].slice(start, end);
        }
      }

      return node;
    }; // end MananaInterprteter.Path()

    // ........................................... 
    this.With = function(form, context) {
      var _parent, res;

      self.context = self.Path(form.path, context);

      if ( ! is(self.context.__parent, "undefined")) {
        _parent = self.context.__parent;
      } else {
        _parent = null;
      }
      self.namespace[form.id] = new MananaNamespace(self.context, _parent);

      res = '';
      for (i in form.body) {
        res += self.evalForm(form.body[i], self.namespace);
      }
      delete self.namespace[form.id];

      return res;
    }; // end MananaInterpreter.With()

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
    this.Text = function(form, context) {
      var i = 0, res = [];
      while ( ! is(form.body[i], "undefined")) {
        res.push(self.evalForm(form.body[i], context));
        i++;
      }
      return res.join(' ');
    }; // end MananaInterpreter.Text()

  } // end MananaInterpreter()

  // _____________________________________________ Make available in both node.js & browser 
  if (typeof window !== "undefined") {
    window.MananaInterpreter = MananaInterpreter;
  } else {
    exports.MananaInterpreter = MananaInterpreter;
  }

})(typeof exports === "undefined" ? this['manana'] = {} : exports);
