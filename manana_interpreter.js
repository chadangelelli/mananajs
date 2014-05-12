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

  function jd(v) {
    console.log(JSON.stringify(v, null, 4));
  }

  // _____________________________________________ Extensions 
  String.prototype.intpol = function(o) {
    return this.replace(/{([^{}]*)}/g, function (a, b) { 
      var r = o[b]; return isStr(r) || isNum(r) ? r : a; 
    });
  };
  
  String.prototype.repeat = function(n) {
    return new Array(n + 1).join(this);
  };

  // _____________________________________________ MananaNamespaces
  MananaNamespace = function(value, parent) {
    this.__value = JSON.parse(JSON.stringify(value));
    this.__parent = parent;
  }; // end MananaNamespace()

  MananaView = function(args) {
    this.name = args.name;
    this.template = args.template;
    //this.context = args.context;
    this.level = args.level; 
    this.parent = args.parent;
  }; // end MananaView()

  // _____________________________________________ Manana
  function Manana() {
    var self = this;

    // ........................................... 
    this.name       = '';
    this.code       = '';
    this.ir         = '';
    this.result     = '';
    this.context    = {};
    this.namespace  = {};
    this.view       = {}; // the current view object
    this.views      = {}; // a cache of all known views
    this.view_level = 0;
    this.view_ancestry = [];

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
      if (isObj(form) && ! is(form.type, "undefined")) {
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
    this.getView = function(name, context, _level, _parent) {
      var template, real_name, _parent;

      if (self.is_server_side) {
        try {
          if (name.slice(0,2) == './') {
            real_name = self.__dirname + '/' + name.slice(2);
          } else {
            real_name = name;
          }
          template = self.file_system.readFileSync(real_name, 'utf-8');
        } catch (e) {
          throw new MananaError("Invalid name '{p}' provided to getView function".intpol({p:name}));
        }
      } else { // self.is_client_side
        scripts = document.getElementsByTagName("script"); 
        for (i = 0, l = scripts.length; i < l; i++) {
          s = scripts[i];
          s_name = s.getAttribute("data-view-name");
          if (s_name == name) {
            template = s.innerHTML;
          }
        }
      }

      if (template) {
        self.views[name] = new MananaView({
          name: name,
          template: template,
          context: context,
          level: _level,
          parent: _parent || null
        });

        jd(self.views[name]);

        return template;
      }

      throw new MananaError("Could not get view '{n}'".intpol({n:name}));
    }; // end Manana.getView()

    // ...........................................  
    this.render = function(name, context, _return_single_line) {
      var i, form;

      self.name = name;
      self.code = self.getView(self.name, context, self.view_level, null);
      self.ir = self.parser.parse(self.code);

      self.namespace.original_context = new MananaNamespace(context || {}, null);
      self.context = context || self.namespace.original_context;

      self.view = self.views[name];
      self.view_ancestry = [self.views[name]];

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
      var code, ir, level, i, form, res;

      self.view_level++;

      try {
        code = self.getView(
                 form.path, 
                 context, 
                 self.view_level, 
                 self.view_ancestry[self.view_level - 1]
               );
        ir = self.parser.parse(code);

        self.view = self.views[form.path];
        self.view_ancestry.push(self.views[form.path]);

        if (self.view_level < self.view_ancestry.length) {
          console.log('yes');
        }

        i = 0;
        res = '';
        while (form = ir[i]) {
          res += self.evalForm(form, context);
          i++;
        }
      } catch (e) {
        throw new MananaError("Include error ('{path}'): ".intpol(form) + e.message, form.loc);
      }

      self.view_level--;

      return res;
    }; // end Manana.Include()

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
      self.namespace[form.id] = new MananaNamespace(self.context, _parent);

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
    }; // end Manana.Alias()

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
    }; // end Manana.If()

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
    }; // end Manana.Function()

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
    }; // end Manana.HTML()

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
    this.log = function() {
      var arg;

      console.log(" ");
      console.log("Manana.log()");
      console.log("- -- --- -- - -- --- -- - -- --- -- - -- --- -- -");
      for (arg in arguments) {
        console.log(JSON.stringify(arguments[arg], null, 4));
      }
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
