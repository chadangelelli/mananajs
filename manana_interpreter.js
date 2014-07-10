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

  Date.locale = {
    en: {
      month_names: [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      month_name_abbrs: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }
  };

  Date.prototype.getMonthName = function(lang, abbr) {
    lang = lang && (lang in Date.locale) ? lang : 'en';
    return abbr 
      ? Date.locale[lang].month_name_abbrs[this.getMonth()]
      : Date.locale[lang].month_names[this.getMonth()];
  };

  Date.prototype.getMonthAbbr = function(lang) {
    return this.getMonthName(lang, true); 
  };

  Date.prototype.getYearAbbr = function() {
    return this.getFullYear().toString().substr(2, 2);
  };

  Date.prototype.getDayName = function() {
    var day = this.getDay();
    return day + day.getSuffix();
  };

  Date.prototype.getMinString = function() {
    var mins = this.getMinutes();
    if ( ! mins) {
      mins = '00';
    }
    return mins;
  };

  Date.prototype.get12HourTime = function(include_seconds) {
    var hours, mins, secs, meridian;

    time       = {};
    time.hours = this.getHours();
    time.mins  = this.getMinutes();
    time.secs  = this.getSeconds();

    if (time.hours == 0) {
      time.meridian = 'AM';
      time.hours = '12';
    } else if (time.hours < 12) {
      time.meridian = 'AM';
    } else { // hours >= 12
      time.meridian = 'PM';
      if (time.hours > 12) {
        time.hours = time.hours - 12;
      }
    }

    if (time.hours.toString().length === 1) 
      time.hours = '0' + time.hours;

    if (time.mins.toString().length === 1) 
      time.mins = '0' + time.mins;

    if (time.secs.toString().length === 1) 
      time.secs = '0' + time.secs;

    return include_seconds
             ? '{hours}:{mins}:{seconds}{meridian}'.intpol(time)
             : '{hours}:{mins}{meridian}'.intpol(time);
  };

  Date.prototype.format = function(format) {
    var self = this;

    return format.replace(/{([^{}]*)}/g, function (a, b) { 
      var r;

      switch (b) {
        case 'year'      : r = self.getFullYear()   ; break;
        case 'year_abbr' : r = self.getYearAbbr()   ; break;
        case 'month'     : r = self.getMonthName()  ; break;
        case 'month_abbr': r = self.getMonthAbbr()  ; break;
        case 'month_no'  : r = self.getMonth() + 1  ; break;
        case 'day'       : r = self.getDayName()    ; break;
        case 'day_no'    : r = self.getDay() + 1    ; break;
        case 'hour'      : r = self.getHours()      ; break;
        case 'time'      : r = self.get12HourTime() ; break;
        case 'min'       : r = self.getMinString()  ; break;
      }

      return isStr(r) || isNum(r) ? r : a;
    });
  };

  Number.prototype.getSuffix = function() {
    var j = this % 10;
    var k = this % 100;
    
    if (j == 1 && k != 11) return this + "st";
    if (j == 2 && k != 12) return this + "nd";
    if (j == 3 && k != 13) return this + "rd";
    /* else */             return this + "th";
  };

  String.prototype.getSuffix = function() {
    return parseInt(this).getSuffix();
  };

  // _____________________________________________ MananaNamespaces
  MananaNamespace = function(name, data, $parent) {
    this.name = name;
    this.data = data;
    this.$parent = $parent;
  }; // end MananaNamespace()

  MananaView = function(args) {
    this.name = args.name;
    this.template = args.template;
    this.context = args.context;
    this.$level = args.$level; 
    this.$parent = args.$parent;
  }; // end MananaView()

  // _____________________________________________ Manana
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
    if ( ! is(module, "undefined") && module.exports) {
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
    this.render = function(name, context, options) {
      var i, form;

      self.name = name;
      self.template = self.getTemplate(self.name);
      self.ir = self.parser.parse(self.template);

      self.namespace.root = new MananaNamespace('root', context || {}, null);
      self.context = self.namespace.root;

      self.views[name] = new MananaView({
        name: name,
        template: self.template,
        context: context,
        $level: 0,
        $parent: null
      });

      self.view = self.views[name];
      self.ancestry = [self.view];

      self.result = '';

      i = 0;
      while (form = self.ir[i]) {
        self.result += self.evalForm(form, context);
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
      return isObj(node)
             && ! is(node.name, "undefined")
             && ! is(node.data, "undefined")
             && ! is(node.$parent, "undefined");
    }; // end Manana.isNamespace()

    // ...........................................  
    this.Path = function(form, context) {
      var node, i, target, index, slice, traceback, meth;

      node = context;
      traceback = [];

      i = 0;
      while ( ! is(form.components[i], "undefined")) {
        target = self.evalForm(form.components[i][0], context);
        index  = self.evalForm(form.components[i][1], context);
        slice  = self.evalForm(form.components[i][2], context);

        traceback.push(target);

        if ( ! is(node[target], "undefined")) {
          node = node[target];

        } else if (self.isNamespace(node) && node.name == target) {
          node = node.data;

        } else if (target == "$manana") {
          node = self;

        } else if (isObj(node['$parent'])) {
          if ( ! is(node['$parent']['data'][target], "undefined")) {
            node = node['$parent']['data'][target];
          } 

        } else if ( ! is(self.namespace[target], "undefined")) {
          node = self.namespace[target];

        } else {
          throw new MananaError("Invalid path: " + traceback.join(" -> "), form.loc);
        }

        if ( ! is(slice, "undefined")) {
          if ( ! isArr(node)) {
            throw new MananaError("slicing attempted on non-list: " + traceback.join(' -> '), form.loc);
          }

          index = parseInt(index);

          if (slice == "*") {
            slice = node.length;
          } else {
            slice = parseInt(slice);
          }

          node  = node.slice(index, slice);

        } else if ( ! is(index, "undefined")) {
          if (isObj(node) && ! is(node[index], "undefined")) {
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
      }

      if (form.methods) {
        i = 0;
        while (meth = form.methods.chain[i]) {
          if (is(node[meth.name], "undefined")) {
            throw new MananaError("Undefined method '{name}' called: ".intpol(meth) + traceback.join(' -> '), meth.loc);
          }

          if ( ! is(node[meth.name], "function")) {
            throw new MananaError("Requested method '{name}' is not a function.".intpol(meth) + traceback.join(' -> '), meth.loc);
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

      if (is(node, "undefined")) {
        throw new MananaError("Invalid path: " + traceback.join(" -> "), form.loc);
      }

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

      self.namespace[name] = data;

      return '';
    }; // end Manana.Alias()

    // ...........................................  
    this.If = function(form, context) {
      var cond, v1, v2, body, else_body, _is_true, res;

      cond = form.condition; 
      _is_true = false;

      if (cond == "exists") {
        try {
          self.Path(form.value_1, context);
          _is_true = true;
        } catch (e) {
          _is_true = false;
        }
      } else {
        v1 = self.evalForm(form.value_1, context);
        v2 = self.evalForm(form.value_2, context);
      
        if      (cond === "true"  && v1      ) _is_true = true; 
        else if (cond === "false" && ! v1    ) _is_true = true; 
        else if (cond === "=="    && v1 == v2) _is_true = true;
        else if (cond === "!="    && v1 != v2) _is_true = true;
        else if (cond === ">"     && v1 >  v2) _is_true = true;
        else if (cond === "<"     && v1 <  v2) _is_true = true;
        else if (cond === ">="    && v1 >= v2) _is_true = true;
        else if (cond === "<="    && v1 <= v2) _is_true = true;
      
        else if (cond === "is") {
          if      (v2 === "Hash"   ) _is_true = isObj(v1);
          else if (v2 === "List"   ) _is_true = isArr(v1);
          else if (v2 === "String" ) _is_true = isStr(v1);
          else if (v2 === "Number" ) _is_true = isNum(v1);
          else if (v2 === "Integer") _is_true = isInt(v1);
          
        } else if (cond === "is not" && ! is(v1, v2)) {
          if      (v2 === "Hash"   ) _is_true = ! isObj(v1);
          else if (v2 === "List"   ) _is_true = ! isArr(v1);
          else if (v2 === "String" ) _is_true = ! isStr(v1);
          else if (v2 === "Number" ) _is_true = ! isNum(v1);
          else if (v2 === "Integer") _is_true = ! isInt(v1);
          
        } else if (cond === "in") {
          if      (isArr(v2) && v2.indexOf(v1) > -1) _is_true = true;
          else if (isObj(v2) && v1 in v2           ) _is_true = true;
        }
      }
       
      if (_is_true) {
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
      var scope, name, data, $parent, key, i, count, total, res;

      scope = self.evalForm(form.path, context);
      name = form.id;
      $parent = self.context;

      total = isObj(scope) ? Object.size(scope) : scope.length;
      count = 0;

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
    this.unbottle = function(brew, indent_char) {
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
        throw new MananaError("Invalid Mañana code unbottled..");
      }

      return { "template": tpl, "context": ctx }
    }; // end Manana.unbottle()

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
  } else {
    exports.Manana = Manana;
  }

})(typeof exports === "undefined" ? {} : exports);
