/* ******************************************************
 * Author: Chad Angelelli <chad@angelel.li>
 * Last Updated: 2014-09-03
 * Contributors/Special Thanks:
 *    Ray Harris <ray@harris.net>
 *    Brigette LeVert <brigette.levert@gmail.com>
 *    Mason Armour <mason@myshorttrack.com>
 *    Chris Hacker <chris@myshorttrack.com>
 * ******************************************************/
(function(exports) {
 
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
      var r = o[b]; 
      return isStr(r) || isNum(r) ? r : a; 
    });
  };

  String.prototype.repeat = function(n) {
    return new Array(n + 1).join(this);
  };

  Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        size++;
      }
    }
    return size;
  };

  // _____________________________________________ Manana
  function MananaNamespace(name, data, $parent) {
    this.type = 'MananaNamespace';
    this.name = name;
    this.data = data;
    this.$parent = $parent;
  } // end MananaNamespace()

  function MananaView(args) {
    this.name = args.name;
    this.template = args.template;
    this.context = args.context;
    this.$level = args.$level; 
    this.$parent = args.$parent;
  } // end MananaView()

  function MananaError(message, loc) {
    this.name = "MananaError";
    this.message = message;
    this.loc = loc;
  } // end Error()

  function Manana(view_dir) {
    var self = this;

    // ........................................... 
    this.name       = '';
    this.template   = '';
    this.ir         = '';
    this.result     = '';
    this.context    = {};
    this.namespace  = {};
    this.view       = {}; // the current view object
    this.views      = {}; // a cache of all known views
    this.view_level = 0;
    this.ancestry   = [];
    this.functions  = {}; this.fns = this.functions;

    // ........................................... 
    if (typeof module !== "undefined" && module && module.exports) {
      this.Parser = require('./manana_parser');
      this.parser = this.Parser.parser;

      this.is_server_side = true;
      this.is_client_side = false;

      this.file_system = require('fs');

      this.__dirname = require('path').dirname(require.main.filename);

      if (is(view_dir, "undefined")) {
        this.view_dir = this.__dirname; 
      } else { 
        this.view_dir = view_dir;
      }

      if (this.view_dir[this.view_dir.length - 1] == '/') {
        this.view_dir = this.view_dir.slice(0, -1);
      }
    } else {
      this.parser = manana_parser;
      this.Parser = manana_parser.Parser;

      this.is_server_side = false;
      this.is_client_side = true;
    }

    // ...........................................  
    this.getTemplate = function(name) {
      var template, abs_name, scripts, i, l, s, s_name;

      if (self.is_server_side) {
        try {
          if (name[0] == '.') {
            abs_name = self.__dirname + '/' + name.slice(2);
          } else if (name[0] == '/') {
            abs_name = name;
          } else {
            abs_name = self.view_dir + '/' + name; 
          }

          if ( ! /\.manana$/.test(abs_name)) {
            abs_name += ".manana";
          }

          template = self.file_system.readFileSync(abs_name, 'utf-8');

        } catch (e) {
          throw new MananaError("Invalid name '{p}' provided to getTemplate function".intpol({p:name}));
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

      if ( ! template.length) {
        throw new MananaError("Template '{n}' has no content.".intpol({n:name}));
      }

      return template;
    }; // end Manana.getTemplate()

    // ...........................................  
    this.evalForm = function(form, context) {
      var res = '', i;

      if (form && (form.type == 'Path' || form.type == 'Function')) {
        return self[form.type](form, context);

      } else if (isObj(form) && ! is(form.type, "undefined")) {
        res += self[form.type](form, context);

      } else if (isArr(form)) {
        i = 0;
        while ( ! is(form[i], "undefined")) {
          res += self.evalForm(form[i], context);
          i++;
        }
      } else {
        res = form;
      }

      return res;
    }; // end Manana.evalForm()

    // ...........................................  
    this.render = function(name, context, options) {
      var i, form, r;

      self.name = name;
      self.template = self.getTemplate(self.name);
      self.ir = self.parser.parse(self.template);

      self.namespace.root = new MananaNamespace('root', context || {}, null);
      self.context = self.namespace.root;

      self.views[name] = new MananaView({
        name: name,
        template: self.template,
        context: self.context,
        $level: 0,
        $parent: null
      });

      self.view = self.views[name];
      self.ancestry = [self.view];

      self.$window;
      if (typeof window !== "undefined") {
        self.$window = window;
      }

      self.result = '';

      i = 0;
      while (form = self.ir[i]) {
        r = self.evalForm(form, self.context);
        self.result += isObj(r) ? JSON.stringify(r) : r;
        i++;
      }

      if (is(options, "undefined")) {
        options = {};
      }

      options.return_single_line = options.return_single_line || false;
      options.encode = options.encode || false;

      if ( ! options.return_single_line) {
        self.result = self.format(self.result, "  ", 0);
      }

      if (options.encode) {
        self.result = self.encode(self.result);
      }

      return self.result;
    }; // end Manana.render()

    // ...........................................  
    this.Include = function(form, context) {
      var name, template, ir, $parent, i, form, res;

      name = self.evalForm(form.path, context);
      template = self.getTemplate(name);
      ir = self.parser.parse(template);

      self.view_level++;

      self.views[name] = new MananaView({
        name: name,
        template: template,
        context: context,
        $level: self.view_level,
        $parent: $parent 
      });

      $parent = self.ancestry[self.view_level - 1]; 
      self.view = self.views[name];

      if (self.view_level < self.ancestry.length) {
        self.ancestry = self.ancestry.slice(0, self.view_level);
      }

      self.ancestry.push(self.views[name]);

      i = 0;
      res = '';
      while (form = ir[i]) {
        res += self.evalForm(form, context);
        i++;
      }

      self.view = $parent;
      self.view_level--;

      return res;
    }; // end Manana.Include()

    // ...........................................  
    this.isNamespace = function(node) {
      var is_ns = false;

      is_ns = node instanceof MananaNamespace;

      if ( ! is_ns) {
        if (node
            && node.type 
            && node.type == 'MananaNamespace'
            && node.name
            && ! is(node.$parent, 'undefined')
            && ! is(node.data, 'undefined'))
        {
          is_ns = true;
        }
      }

      return is_ns;
    }; // end Manana.isNamespace()

    // ...........................................  
    this.Path = function(form, context) {
      var node, components, target, i, index, slice, traceback, meth;

      node = context;
      components = JSON.parse(JSON.stringify(form.components));
      traceback = [];

      if (components[0][0] == '$manana') {
        node = self;
        traceback.push(components[0][0]);
        components.shift();

      } else if (components[0][0] == '$window') {
        if (typeof window !== 'undefined') {
          node = window;
          traceback.push(components[0][0]);
          components.shift();
        } else {
          throw new MananaError("Invalid path: window is not defined");
        }
      }

      i = 0;
      while ( ! is(components[i], "undefined")) {
        target = self.evalForm(components[i][0], context);
        index  = self.evalForm(components[i][1], context);
        slice  = self.evalForm(components[i][2], context);

        traceback.push(target);

        //................ 
        if (self.isNamespace(node)) {

          if (target[0] == '$' && ! is(node[target], 'undefined')) {
            node = node[target];

          } else if ( ! isNull(node.data) && ! is(node.data[target], 'undefined')) {
            node = node.data[target];

          } else if (node.name == target) {
            node = node.data;

          } else if (self.isNamespace(node.$parent)
                     && ! isNull(node.$parent.data[target])
                     && ! is(node.$parent.data[target], 'undefined')) 
          {
            node = node.$parent.data[target];

          } else if ( ! is(self.namespace[target], 'undefined')) {
            node = self.namespace[target];

          } else {
            throw new MananaError('Invalid path in namespace: "' + traceback.join('.') + '"', form.loc);
          }

        } else if ( ! is(node, 'undefined')) { 
          if ( ! is(node[target], "undefined")) {
            node = node[target];
          } else {
            throw new MananaError('Invalid path: "' + traceback.join('.') + '"', form.loc);
          }

        } else {
          throw new MananaError("Undefined path: " + traceback.join('.'), form.loc);
        }

        //................ 
        if ( ! is(slice, 'undefined')) {
          if ( ! isArr(node)) {
            throw new MananaError('slicing attempted on non-list: ' + traceback.join('.'), form.loc);
          }

          index = parseInt(index);

          if (slice == '*') {
            slice = node.length;
          } else {
            slice = parseInt(slice);
          }

          node  = node.slice(index, slice);

        } else if ( ! is(index, 'undefined')) {
          if (isObj(node) && ! is(node[index], 'undefined')) {
            node = node[index];
          } else {
            index = parseInt(index);
            if (index < 0) {
              index = node.length + index;
            }
            node = node[index];
          }
        }

        i++;
      } // end while

      //................ 
      if (form.methods) {
        i = 0;
        while (meth = form.methods.chain[i]) {
          if (is(node[meth.name], 'undefined')) {
            throw new MananaError("Undefined method '{name}' called: ".intpol(meth) + traceback.join('.'), meth.loc);
          }

          if ( ! is(node[meth.name], 'function')) {
            throw new MananaError("Requested method '{name}' is not a function.".intpol(meth) + traceback.join('.'), meth.loc);
          }

          try {
            if (isArr(meth.args) && meth.args.length) {
              node = node[meth.name].apply(self, meth.args);
            } else {
              node = node[meth.name]();
            }
          } catch (e) {
            throw new MananaError(e, meth.loc);
          }
          i++;
        }
      }

      //................ 
      if (is(node, 'undefined')) {
        throw new MananaError("Can't find path: " + traceback.join('.'), form.loc);
      }

      //................ 
      return node;
    }; // end Interprteter.Path()

    // ........................................... 
    this.With = function(form, context) {
      var name, data, $parent, res;

      name = form.id;
      data = self.evalForm(form.path, context);

      $parent = self.context;
      self.namespace[name] = new MananaNamespace(name, data, $parent);
      self.context = self.namespace[name];

      res = '';
      for (i in form.body) {
        res += self.evalForm(form.body[i], self.context);
      }

      delete self.namespace[name];

      self.context = $parent;

      return res;
    }; // end Manana.With()

    // ...........................................  
    this.Alias = function(form, context) {
      var name, data;

      name = form.id;
      data = self.evalForm(form.path, context);

      if ( ! self.isNamespace(context)) {
        throw new MananaError("Invalid context passed to Alias method. Must be a valid namespace.");
      }

      if ( ! is(context[name], "undefined")) {
        throw new MananaError("Can't alias '{id}'. Name already taken in current context.".intpol(form));
      }

      context.data[name] = data;

      return '';
    }; // end Manana.Alias()

    // ...........................................  
    this.If = function(form, context) {
      var cases, else_case, i, j, c, cond, compound, operator, value, previous_outcome, outcome, res;

      cases = JSON.parse(JSON.stringify(form.body));

      if (cases[cases.length-1]['case'] == 'else') {
        else_case = cases.pop();
      }

      i = 0;
      while (c = cases[i]) {
        outcome = false;

        j = 0;
        while (cond = c.conditions[j]) {
          compound = cond[0];
          operator = cond[1][0];
          value = cond[1].slice(1);

          previous_outcome = outcome;

          if (operator == 'true' || operator == 'not_true') {
            value[0] = self.evalForm(value[0], context);

            if (value[0]) {
              outcome = true;
            } else {
              outcome = false;
            }

            if (operator == 'not_true') {
              outcome = ! outcome;
            }

          } else if (operator == 'exists' || operator == 'not_exists') {
            try {
              value[0] = self.evalForm(value[0], context);
              outcome = true;
            } catch (e) {
              outcome = false;
            }

            if (operator == 'not_exists') {
              outcome = ! outcome;
            }

          } else if (operator == 'in' || operator == 'not_in') {
            value[0] = self.evalForm(value[0], context);
            value[1] = self.evalForm(value[1], context);

            if (isArr(value[1])) {
              outcome = value[1].indexOf(value[0]) > -1;
            } else if (isObj(value[1])) {
              outcome = value[0] in value[1];
            }

            if (operator == 'not_in') {
              outcome = ! outcome;
            }

          } else if (operator == 'is' || operator == 'not_is') {
            value[0] = self.evalForm(value[0], context);

            if      (value[1] == 'Hash'   ) outcome = isObj(value[0]);
            else if (value[1] == 'List'   ) outcome = isArr(value[0]);
            else if (value[1] == 'String' ) outcome = isStr(value[0]);
            else if (value[1] == 'Number' ) outcome = isNum(value[0]);
            else if (value[1] == 'Integer') outcome = isInt(value[0]);

            if (operator == 'not_is') {
              outcome = ! outcome;
            } 

          } else {
            value[0] = self.evalForm(value[0], context);
            value[1] = self.evalForm(value[1], context);

            switch (operator) {
              case '==': outcome = value[0] == value[1]; break;
              case '!=': outcome = value[0] != value[1]; break;
              case '>' : outcome = value[0] >  value[1]; break;
              case '<' : outcome = value[0] <  value[1]; break;
              case '>=': outcome = value[0] >= value[1]; break;
              case '<=': outcome = value[0] <= value[1]; break;
              default  : outcome = false;
            }
          }

          if (compound == 'and') {
            outcome = outcome && previous_outcome;
          } else if (compound == 'or') {
            outcome = outcome || previous_outcome;
          }

          j++;
        } // end while(conditions)

        if (outcome) {
          res = self.evalForm(c.body, context);
          break;
        }

        i++;
      } // end while(if/elif)

      if ( ! outcome && else_case) {
        res = self.evalForm(else_case.body, context);
      }

      if (is(res, 'undefined')) {
        res = '';
      }

      return res;
    }; // end Manana.If()

    // ...........................................  
    this.For = function(form, context) {
      var scope, name, is_namespace, data, $parent, key, i, count, total, res;

      scope = self.evalForm(form.path, context);
      name = form.id;
      $parent = self.context;

      total = isObj(scope) ? Object.size(scope) : scope.length;
      count = 0;

      if (self.isNamespace(scope)) {
        scope = scope.data;
      }

      console.log('SCOPE: ', scope);

      res = '';
      for (key in scope) {
        data = scope[key];
        count++;

        self.namespace[name] = new MananaNamespace(name, data, $parent);
        self.namespace[name]['$key'] = key;
        self.namespace[name]['$count'] = count;
        self.namespace[name]['$total'] = total;
        self.namespace[name]['$is_first'] = (count == 1);
        self.namespace[name]['$is_last'] = (count == total);

        self.context = self.namespace[name];

        for (i in form.body) {
          res += self.evalForm(form.body[i], self.context);
        }
      }

      delete self.namespace[name];

      self.context = $parent;
      
      return res;
    }; // end Manana.For()

    // ...........................................  
    this.MananaString = function(form, context) {
      var i = 0, res = '';

      while (form.body[i]) {
        res += self.evalForm(form.body[i], context);
        i++;
      }

      return res;
    } // end Manana.MananaString()

    // ...........................................  
    this.Tag = function(form, context) {
      var html, attr_tpl, content, i, kv;

      html = '<{tag}{attrs}>{body}</{tag}>'; 
      attr_tpl = ' {key}="{val}"'; 
      content = { tag: form.tag, attrs: '', body: '' };

      if (isArr(form.attrs)) {
        i = 0;
        while (form.attrs[i]) {
          kv = {};
          if (form.attrs[i][0] == "src" && form.tag == "a") {
            kv.key = "href";
          } else {
            kv.key = self.evalForm(form.attrs[i][0], context);
          } 
          kv.val = self.evalForm(form.attrs[i][1], context); 
          content.attrs += attr_tpl.intpol(kv); 
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
    this.CodeTag = function(form, context) {
      var html, attr_tpl, content, i, kv;

      html = '<{tag}{attrs}>{body}</{tag}>'; 
      attr_tpl = ' {key}="{val}"'; 
      content = { tag: form.tag, attrs: '', body: '' };

      if (isArr(form.attrs)) {
        i = 0;
        while (form.attrs[i]) {
          kv = {};
          if (form.attrs[i][0] == "src" && form.tag == "a") {
            kv.key = "href";
          } else {
            kv.key = self.evalForm(form.attrs[i][0], context);
          } 
          kv.val = self.evalForm(form.attrs[i][1], context); 
          content.attrs += attr_tpl.intpol(kv); 
          i++; 
        }
      }

      content.body = "\n" + form.body.join("\n");

      return html.intpol(content);
    }; // end Manana.PreTag()

    // ...........................................  
    this.VoidTag = function(form, context) {
      var html, attr_tpl, content, i;

      html = '<{tag}{attrs}>';
      attr_tpl = ' {key}="{val}"';
      content = { tag: form.tag, attrs: '' };

      if (isArr(form.attrs)) {
        i = 0;
        while (form.attrs[i]) {
          content.attrs += attr_tpl.intpol({ 
                             key: self.evalForm(form.attrs[i][0], context), 
                             val: self.evalForm(form.attrs[i][1], context)
                           })
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
            if (tag == open_tags[open_tags.length-1]) {
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
    this.encode = function(html) {
      return String(html)
               .replace( /&/g, '&amp;'  )
               .replace( /"/g, '&quot;' )
               .replace( /'/g, '&#39;'  )
               .replace( /</g, '&lt;'   )
               .replace( />/g, '&gt;'   );
    }; // end Manana.encode()

    // ...........................................  
    this.decode = function(encoded) {
      return String(encoded)
               .replace( /&amp;/g  , '&' )
               .replace( /&quot;/g , '"' )
               .replace( /&\#39;/g , "'" )
               .replace( /&lt;/g   , '<' )
               .replace( /&gt;/g   , '>' );
    }; // end Manana.decode()

    // ...........................................  
    this.bottle = function(code, context) {
      var i, lines, line, indent_pat, indent, brew;

      if (is(context, "undefined")) {
        context = {};
      }

      try {
        self.parser.parse(code);
      } catch (e) {
        throw new MananaError("Invalid Mañana code sent to Bottle method.");
      }

      try {
        JSON.parse(JSON.stringify(context));
      } catch (e) {
        throw new MananaError("Invalid context sent to Bottle method.");
      }

      lines = code.split(/\n/g);
      indent_pat = /^([\t\s][\t\s]*)/;

      brew = '#ñ(role="template")';
      for (i in lines) {
        line = lines[i];

        indent = line.match(indent_pat);
        if (indent === null) {
          indent = 0;
        } else {
          indent = indent[1].length;
        }

        line = line.replace(indent_pat, '');
        brew += '#ñ{' + indent + '}' + line;
      }

      brew += '#ñ(role="context")' + JSON.stringify(context);

      return brew;
    }; // end Manana.bottle()

    // ...........................................  
    this.pour = function(brew, indent_char) {
      var parts, tpl, ctx, i, lines, line, indent;

      if ( ! /^\#ñ\(role="template"\)(?=\#ñ\{)/.test(brew)) {
        throw new MananaError("Invalid brew provided to Unbottle method.");
      }

      brew = brew.replace('#ñ(role="template")', '');
      parts = brew.split('#ñ(role="context")');
      tpl = parts[0];
      ctx = parts[1];

      try {
        ctx = JSON.parse(ctx);
      } catch (e) {
        throw new MananaError("Invalid context provided to Unbottle method.");
      }

      if ( ! indent_char) {
        indent_char = ' ';
      }

      lines = tpl.split(/(\#ñ\{[0-9][0-9]*\})/g);
      if (lines[0] === '') {
        lines = lines.slice(1);
      }

      tpl = '';
      for (i=0, l=lines.length; i < l; i += 2) {
        indent = lines[i]
                   .replace( '#ñ{' , '')
                   .replace( '}'   , '');
        indent = indent_char.repeat(parseInt(indent));

        line = lines[i + 1];

        tpl += indent + line + "\n";
      }

      try {
        self.parser.parse(tpl);
      } catch (e) {
        throw new MananaError("Invalid Mañana code pourd..");
      }

      return { "template": tpl, "context": ctx }
    }; // end Manana.pour()

    // ...........................................  
    this.Function = function(form, context) {
      var fn_name, i, args, res;

      fn_name = form.name;

      if (is(self.functions[fn_name], "undefined")) {
        throw new MananaError(
                    "Function '{name}' is not defined. Call 'Manana.add_fn(name, fn)' to add it"
                    .intpol(form)
                  );
      }

      if ( ! is(self.functions[fn_name], "function")) {
        throw new MananaError("'{name}' is not a function".intpol(form));
      }

      args = [];
      if (form.args) {
        i = 0;
        while ( ! is(form.args[i], "undefined")) {
          args.push(self.evalForm(form.args[i], context));
          i++;
        }
      }

      try {
        res = args.length
                ? self.functions[fn_name].apply(self, args)
                : self.functions[fn_name]();
      } catch (e) {
        throw new MananaError(e, form.loc);
      }

      return res;
    }; // end Manana.Function()

    // ...........................................  
    this.functions.debug = function() {
      console.log('view: ', self.view);
      console.log('context: ', self.context);
      console.log('Manana: ', self);
      return '';
    }; // end Manana.debug()

    // ...........................................  
    this.functions.print = function() {
      var res = '', i = 0;
      while ( ! is(arguments[i], "undefined")) {
        res += JSON.stringify(arguments[i], null, 4);
        i++;
      }
      return res;
    }; // end Manana.print()

    // ...........................................  
    this.functions.context = function() {
      return JSON.stringify(self.context);
    }; // end Manana.context()

    // ...........................................  
    this.functions.view = function() {
      var out = JSON.stringify(self.view, null, 4).split("\n")
      out.unshift("<pre>");
      out.push("</pre>");
      return out.join("\n    ");
    }; // end Manana.view()

    // ...........................................  
    this.functions.whatis = function(x) {
      console.log(x);
      return '<pre>' + JSON.stringify(x, null, 4) + '</pre>';
    };

    // ...........................................  
    this.functions.date = function(date, format) {
      try {
        date = new Date(date);
      } catch (e) {
        throw new MananaError("Invalid date '{d}' for date() function.".intpol({ d: date }));
      }

      if (is(format, "undefined")) {
        format = "{month} {day}, {year} at {time}";
      }
  
      return date.format(format);
    }; // end Manana.date()

    // ...........................................  
    this.add_fn = function(name, fn) {
      if ( ! isStr(name)) {
        throw new MananaError("1st arg to Manana.add_fn() must be a string");
      }

      if ( ! is(fn, "function")) {
        throw new MananaError("2nd arg to Manana.add_fn() must be a function");
      }

      self.functions[name] = fn;
    }; // end Manana.add_fn()

  } // end Manana() 


  // _____________________________________________ Make available in both node.js & browser 
  if (typeof window !== "undefined") {
    window.Manana = Manana;
    window.MananaNamespace = MananaNamespace;
    window.MananaView = MananaView;
    window.MananaError = MananaError;
  } else {
    exports.Manana = Manana;
    exports.MananaNamespace = MananaNamespace;
    exports.MananaView = MananaView;
    exports.MananaError = MananaError;
  }

})(typeof exports === "undefined" ? {} : exports);
