(function(exports) {
 
  // _____________________________________________ Error-handling
  function MananaError(message, loc) {
    this.name = "MananaError";
    this.message = message;
    this.loc = loc;
  } // end Error()

  // _____________________________________________ Validation shorthand 
  function is(v, t)  { return typeof v === t; }
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
  
  String.prototype.repeat = function(n) {
    return new Array(n + 1).join(this);
  };

  // _____________________________________________ Namespaces
  Namespace = function(value, parent) {
    this.__value = JSON.parse(JSON.stringify(value));
    this.__parent = parent;
  }; // end Namespace()

  // _____________________________________________ Manana
  function Manana() {
    var self = this;

    // ........................................... 
    this.view_path    = '';
    this.code         = '';
    this.ir           = '';
    this.current_view = '';
    this.result       = '';
    this.context      = {};
    this.namespace    = {};
    this.views        = {};

    // ........................................... 
    if (typeof module !== "undefined" && module.exports) {
      this.Parser = require('./manana_parser');
      this.parser = this.Parser.parser;

      this.is_server_side = true;
      this.is_client_side = false;

      this.file_system = require('fs');
      this.__dirname = require('path').dirname(require.main.filename);

    } else {
      this.parser = manana_parser;
      this.Parser = manana_parser.Parser;

      this.is_server_side = false;
      this.is_client_side = true;
    }

    // ...........................................  
    this.evalForm = function(form, context) {
      var res = '', i;
      if (isObj(form)) {
        res += self[form.type](form, context);
      } else if (isArr(form)) {
        i = 0;
        while ( ! is(form[i], "undefined")) {
          res += self.evalForm(form[i], context);
          i++;
        }
      } else {
        return form;
      }
      return res;
    }; // end Manana.evalForm()

    // ...........................................  
    this.render = function(path, context, _return_single_line) {
      var i, form;

      self.path = path;
      self.code = self.getView(self.path);
      self.ir = self.parser.parse(self.code);

      self.namespace.original_context = new Namespace(context || {}, null);
      self.context = context || self.namespace.original_context;

      self.result = '';

      i = 0;
      while (form = self.ir[i]) {
        self.result += self.evalForm(form, context);
        i++;
      }

      return _return_single_line 
               ? self. result
               : self.format(self.result, ' ', 0);
    }; // end Manana.render()

    // ...........................................  
    this.Include = function(form, context) {
      var code, ir, i, form, res;

      try {
        code = self.getView(form.path);
        ir = self.parse(code);

        i = 0;
        res = '';
        while (form = ir[i]) {
          res += self.evalForm(form, context);
          i++;
        }
      } catch (e) {
        throw new MananaError("Include error ('{path}'): ".intpol(form) + e.message, form.loc);
      }

      return res;
    } // end Manana.Include()

    // ...........................................  
    this.Path = function(form, context) {
      var node, el, i, key, start, end, index;

      node = context;
      for (i in form.components) {
        el = form.components[i];

        if ('__value' in node && '__parent' in node) {
          node = node.__value;
        }

        if (is(node[el[0]], "undefined")) {
          throw new MananaError("Invalid path element '{e}' in path:\n\tCOMPONENTS: {p}\n\tNODE: {n}"
                                  .intpol({
                                     e: el[0], 
                                     p: JSON.stringify(form.components),
                                     n: JSON.stringify(node)
                                  }), form.loc);
        }

        // Object
        if (el.length == 1) { 
          node = node[el[0]].__value || node[el[0]];

        // Array
        } else { 
          if ( ! isArr(node[el[0]])) {
            throw new MananaError("Object at '{e}' is not an Array".intpol({e:el[0]}), form.loc);
          }

          if (el.length == 2) {
            index = parseInt(el[1]); 
            node = node[el[0]][index];
          } else {
            start = parseInt(el[1]);
            if (el[2] == '*') {
              end = node[el[0]].length;
            } else {
              end = parseInt(el[2]) + 1;
            }
            node = node[el[0]].slice(start, end);
          }
        }
      }

      return node;
    }; // end Interprteter.Path()

    // ........................................... 
    this.With = function(form, context) {
      var _parent, res;

      self.context = self.Path(form.path, context);

      if ( ! is(self.context.__parent, "undefined")) {
        _parent = self.context.__parent;
      } else {
        _parent = null;
      }
      self.namespace[form.id] = new Namespace(self.context, _parent);

      res = '';
      for (i in form.body) {
        res += self.evalForm(form.body[i], self.namespace);
      }
      delete self.namespace[form.id];

      return res;
    }; // end Manana.With()

    // ...........................................  
    this.Alias = function(form, context) {
      console.log("Alias called(). function not completed.");
    } // end Manana.Alias()

    // ...........................................  
    this.If = function(form, context) {
      var cond, v1, v2, body, else_body, _cond_true, res;

      cond = form.condition; 
      v1 = self.evalForm(form.value_1, context);
      v2 = self.evalForm(form.value_2, context);

      _cond_true = false;
      if      (cond === "true"  && v1      ) _cond_true = true; 
      else if (cond === "false" && ! v1    ) _cond_true = true; 
      else if (cond === "=="    && v1 == v2) _cond_true = true;
      else if (cond === "!="    && v1 != v2) _cond_true = true;
      else if (cond === ">"     && v1 >  v2) _cond_true = true;
      else if (cond === "<"     && v1 <  v2) _cond_true = true;
      else if (cond === ">="    && v1 >= v2) _cond_true = true;
      else if (cond === "<="    && v1 <= v2) _cond_true = true;

      else if (cond === "is") {
        if      (v2 === "Hash"   ) _cond_true = isObj(v1);
        else if (v2 === "List"   ) _cond_true = isArr(v1);
        else if (v2 === "String" ) _cond_true = isStr(v1);
        else if (v2 === "Number" ) _cond_true = isNum(v1);
        else if (v2 === "Integer") _cond_true = isInt(v1);
        
      } else if (cond === "is not" && ! is(v1, v2)) {
        if      (v2 === "Hash"   ) _cond_true = ! isObj(v1);
        else if (v2 === "List"   ) _cond_true = ! isArr(v1);
        else if (v2 === "String" ) _cond_true = ! isStr(v1);
        else if (v2 === "Number" ) _cond_true = ! isNum(v1);
        else if (v2 === "Integer") _cond_true = ! isInt(v1);
        
      } else if (cond === "in") {
        if      (isArr(v2) && v2.indexOf(v1) > -1) _cond_true = true;
        else if (isObj(v2) && v1 in v2           ) _cond_true = true;
      }

      if (_cond_true) {
        res = self.evalForm(form.body, context);
      } else if ( ! isNull(form.else_body)) {
        res = self.evalForm(form.else_body, context);
      } else {
        res = '';
      }

      return res;
    } // end Manana.If()

    // ...........................................  
    this.For = function(form, context) {
      var key, i, res;

      self.context = self.Path(form.path, context);

      res = '';
      for (key in self.context) {
        self.namespace[form.id] = new Namespace(self.context[key], self.context);
        for (i in form.body) {
          res += self.evalForm(form.body[i], self.namespace);
        }
      }
      delete self.namespace[form.id];
      
      return res;
    }; // end Manana.For()

    // ...........................................  
    this.Function = function(form, context) {
      var fn_name, i, args, res;

      fn_name = form.name;

      if (is(self[fn_name], "undefined")) {
        throw new MananaError("function '{name}' is not defined in Manana".intpol(form));
      }

      if ( ! is(self[fn_name], "function")) {
        throw new MananaError("'{name}' is not a function".intpol(form));
      }

      i = 0;
      args = [];
      while ( ! is(form.args[i], "undefined")) {
        args.push(self.evalForm(form.args[i], context));
        i++;
      }

      try {
        res = self[fn_name].apply(self, args);
      } catch (e) {
        throw new MananaError(e, form.loc);
      }

      return res;
    } // end Manana.Function()

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
    }; // end Manana.Tag()

    // ...........................................  
    this.HTML = function(form, context) {
      return form.body;
    } // end Manana.HTML()

    // ...........................................  
    this.VoidTag = function(form, context) {
      var html, attr_tpl, content, i;

      html = '<{tag}{attrs}>';
      attr_tpl = ' {key}="{val}"';
      content = { tag: form.tag, attrs: '' };

      if (isArr(form.attrs)) {
        i = 0;
        while (form.attrs[i]) {
          content.attrs += attr_tpl.intpol({ key: form.attrs[i][0], val: form.attrs[i][1] })
          i++; 
        }
      }

      return html.intpol(content);
    }; // end Manana.VoidTag()

    // ...........................................  
    this.Text = function(form, context) {
      var i = 0, res = [];
      while ( ! is(form.body[i], "undefined")) {
        res.push(self.evalForm(form.body[i], context));
        i++;
      }
      return res.join(' ');
    }; // end Manana.Text()

    // ...........................................  
    this.Filter = function(form, context) {
      var i = 0, res = [];
      while ( ! is(form.body[i], "undefined")) {
        res.push(self.evalForm(form.body[i], context));
        i++;
      }
      return res.join(' ');
    }; // end Manana.Filter()

    // ...........................................  
    this.getView = function(path) {
      var template;

      if (self.is_server_side) {
        try {
          if (path.slice(0,2) == './') {
            path = self.__dirname + '/' + path.slice(2);
          }
          template = self.file_system.readFileSync(path, 'utf-8');
        } catch (e) {
          throw new MananaError("Invalid path '{p}' provided to getView function".intpol({p:path}));
        }
      } else {
        scripts = document.getElementsByTagName("script"); 
        for (i = 0, l = scripts.length; i < l; i++) {
          s = scripts[i];
          s_name = s.getAttribute("data-view-name");
          if (s_name == path) {
            template = s.innerHTML;
          }
        }
      }

      if (template) {
        return template;
      }
      throw new MananaError("Could not get view '{p}'".intpol({p:path}));
    } // end Manana.getView()

    // ...........................................  
    this.format = function(html, indent, indent_level, loc) {
      var orig_indent_level, tokens, extract_close_tag, open_tags, void_tags, padding, tag, i, t, r;

      if (is(html, "undefined")) {
        throw new MananaError("format() functions requires render() to be run first");
      }

      if (is(indent, "undefined")) {
        throw new MananaError("format() requires and indentation string for its 2nd arg.");
      }

      if (is(indent_level, "undefined")) {
        indent_level = 0;
      }

      function line(token, indent_plus_one) {
        if ( ! is(indent_plus_one, "undefined")) {
          padding = indent.repeat(indent_level + 1);
        } else {
          padding = indent.repeat(indent_level);
        }
        return '{p}{t}'.intpol({p:padding, t:token})
      }

      function is_main_block(tag) {
        return ['html', 'head', 'body'].indexOf(tag) > -1;
      }

      void_tags = [
        "area", "base", "br", "col", "embed", "hr", "img", "input", "keygen",
        "link", "menuitem", "meta", "param", "source", "track", "wbr"
      ];

      orig_indent_level = indent_level;
      tokens = self.result.split(/(<[^>]+>)/);
      open_tags = [];
     
      r = [];
      for (i in tokens) {
        t = tokens[i];

        if (t.length) {
          if ('<!' == t.slice(0, 2)) {
            r.push(line(t));
          } else if ('</' == t.slice(0, 2)) {
            r.push(line(t));
            tag = t.replace(/[<>\/ ]/g, '');
            if (tag == open_tags[open_tags.length -1]) {
              open_tags.pop();
              indent_level--;
            }
          } else if ('<' == t[0]) {
            tag = t.split(' ')[0].slice(1).replace('>', '');
            if (void_tags.indexOf(tag) == -1) {
              open_tags.push(tag);
              indent_level++;
            }
            if (is_main_block(tag)) {
              indent_level = orig_indent_level;
            }
            r.push(line(t))
          } else {
            r.push(line(t, indent_level))
          }
        }
      }
    
      return r.join("\n");
    }; // end Manana.format()

    // ...........................................  
    this.log = function(value) {
      console.log(" ");
      console.log("Manana.log()");
      console.log("Output:");
      console.log("- -- --- -- - -- --- -- - -- --- -- - -- --- -- -");
      console.log(value);
      console.log("- -- --- -- - -- --- -- - -- --- -- - -- --- -- -");
      console.log(" ");
      return '';
    }; // end Manana.log()

  } // end Manana()

  // _____________________________________________ Make available in both node.js & browser 
  if (typeof window !== "undefined") {
    window.Manana = Manana;
  } else {
    exports.Manana = Manana;
  }

})(typeof exports === "undefined" ? {} : exports);
