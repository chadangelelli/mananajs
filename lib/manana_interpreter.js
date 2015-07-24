/* ******************************************************
 * Author: Chad Angelelli <chad@angelel.li>
 * Contributors/Special Thanks:
 *    Ray Harris <ray@harris.net>
 *    Mason Armour <mason@myshorttrack.com>
 *    Chris Hacker <chris@myshorttrack.com>
 *    Brigette LeVert <brigette.levert@gmail.com>
 * ******************************************************/

(function(exports) {
  var _manana_is_server_side, _manana_is_client_side;

  // _____________________________________________ Validation shorthand 
  function is(v, t)  { return typeof v === t; }
  function isNull(v) { return v === null; }
  function isStr(v)  { return is(v, "string"); }
  function isNum(v)  { return is(v, "number"); }
  function isInt(v)  { return is(v, "number") && parseFloat(v) == parseInt(v, 10) && ! isNaN(v); }
  function isArr(v)  { return Object.prototype.toString.call(v) === '[object Array]'; }
  function isObj(v)  { return Object.prototype.toString.call(v) === '[object Object]'; }

  _manana_is_server_side =  typeof require        !== 'undefined' && 
                            typeof module         !== 'undefined' && 
                            typeof module.exports !== 'undefined' ;

  _manana_is_client_side = ! _manana_is_server_side;
 
  // _____________________________________________ Extensions 
  String.prototype.strFmt = function(o) {
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

  function jd(label, x) {
    console.log("\n\n" + label + "\n==========================================>\n>>>");
    console.log(JSON.stringify(x, null, 4));
    console.log("\n\n<<< END " + label + "\n\n");
  }

  // _____________________________________________ Mañana
  function MananaNamespace(name, data, $parent) {
    this.type    = 'MananaNamespace';
    this.name    = name;
    this.data    = data;
    this.$parent = $parent;
  } // end MananaNamespace()

  function MananaView(args) {
    this.name     = args.name;
    this.template = args.template;
    this.context  = args.context;
    this.$level   = args.$level; 
    this.$parent  = args.$parent;
  } // end MananaView()

  function MananaError(message, loc) {
    this.name = "MananaError";
    this.message = message;
    this.loc = loc;
  } // end Error()

  function Manana(view_dir) {
    var self = this;

    // ........................................... 
    this.name           = '';
    this.template       = '';
    this.ir             = '';
    this.result         = '';
    this.context        = {};
    this.aliases        = [];
    this.namespace      = {};
    this.view           = {}; // the current view object
    this.views          = {}; // a cache of all known views
    this.view_level     = 0;
    this.ancestry       = [];
    this.fns            = {};
    this.raw_fns        = {};
    this.is_server_side = _manana_is_server_side;
    this.is_client_side = ! _manana_is_server_side;
    this.in_loop        = false;
    this.break_loop     = false;
    this.continue_loop  = false;

    // ........................................... 
    if (this.is_server_side) {
      if (typeof manana_parser !== 'undefined') {
        this.parser = manana_parser;
        this.Parser = manana_parser.Parser;
      } else {
        this.Parser = require('./manana_parser');
        this.parser = this.Parser.parser;
      }

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
          throw new MananaError("Invalid name '{p}' provided to getTemplate function".strFmt({p:name}));
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
        throw new MananaError("Template '{n}' has no content.".strFmt({n:name}));
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
      self.aliases = [];

      self.views[name] = new MananaView({
        name: name,
        template: self.template,
        context: self.context,
        $level: 0,
        $parent: null
      });

      self.view = self.views[name];
      self.ancestry = [self.view];

      self['$window'];
      if (typeof window !== "undefined") {
        self['$window'] = window;
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

      i = 0;
      while (self.aliases[i]) {
        i++;
        delete self.namespace[self.aliases[i]];
      }

      return self.result;
    }; // end Manana.render()

    // ...........................................  
    this.Include = function(form, context) {
      var name, template, ir, $parent, i, form, res;

      name = self.evalForm(form.path, context);
      template = self.getTemplate(name);
      ir = self.parser.parse(template);

      $parent = self.view;
      self.view_level++;

      self.views[name] = new MananaView({
        name: name,
        template: template,
        context: context,
        $level: self.view_level,
        $parent: $parent 
      });

      self.view = self.views[name];

      if (self.view_level < self.ancestry.length) {
        self.ancestry = self.ancestry.slice(0, self.view_level);
      }

      self.ancestry.push(self.view);

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
      var node, components, target, i, index, slice, traceback, meth, tmp_node, _node_set;
      var traceback_str, index_str, slice_str;

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
          throw new MananaError("Invalid path: $window is not defined");
        }
      }

      i = 0;
      while ( ! is(components[i], "undefined")) {
        target = self.evalForm(components[i][0], context);
        index  = self.evalForm(components[i][1], context);
        slice  = self.evalForm(components[i][2], context);

        index_str = (index === '*' ? '' : index);
        slice_str = (slice === '*' ? '' : slice);

        if ( ! is(index, 'undefined')) {
          if ( ! is(slice, 'undefined')) {
            traceback_str = target + '[' + index_str + ':' + slice_str + ']';
          } else {
            traceback_str = target + '[' + index_str + ']';
          }
        } else if ( ! is(slice, 'undefined')) {
          traceback_str = target + '[:' + slice_str + ']';
        } else {
          traceback_str = target;
        }

        traceback.push(traceback_str);

        //................ 
        if (self.isNamespace(node)) {
          if (target[0] == '$' && ! is(node[target], 'undefined')) {
            node = node[target];

          } else if ( ! isNull(node.data) && ! is(node.data[target], 'undefined')) {
            node = node.data[target];

          } else if (node.name == target) {
            node = node.data;

          } else if ( ! is(self.namespace[target], 'undefined')) {
            node = self.namespace[target];

          } else if (node.$parent) {
            tmp_node = node;
            while (tmp_node.$parent) {
              tmp_node = tmp_node.$parent;
              if ( ! is(tmp_node.data[target], 'undefined')) {
                node = tmp_node.data[target];
                _node_set = true;
                break;
              }
            }

            if ( ! _node_set) {
              throw new MananaError('Could not find path in ancestry: "' + traceback.join('.') + '"', form.loc);
            }

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
          if (isStr(node)) {
            node = node.split('');
          } else if ( ! isArr(node)) {
            throw new MananaError('slicing attempted on non-list: ' + traceback.join('.'), form.loc);
          }

          index = index === '*' ? 0 : parseInt(index);
          slice = slice === '*' ? node.length : parseInt(slice);
          node = node.slice(index, slice);

        } else if ( ! is(index, 'undefined')) {
          if (isObj(node) && ! is(node[index], 'undefined')) {
            node = node[index];
          } else {
            index = index === '*' ? 0 : parseInt(index);
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
            throw new MananaError("Undefined method '{name}' called: ".strFmt(meth) + traceback.join('.'), meth.loc);
          }

          if ( ! is(node[meth.name], 'function')) {
            throw new MananaError("Requested method '{name}' is not a function.".strFmt(meth) + traceback.join('.'), meth.loc);
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
    this.Name = function(form, context) {
      var res;

      try {
        res = self.evalForm(form.path, context);
      } catch (e) {
        if ('default_value' in form && !isNull(form.default_value)) {
          res = self.evalForm(form.default_value, context);
        } else {
          throw e;
        }
      }

      return res;
    }; // end Interpreter.Name()

    // ........................................... 
    this.With = function(form, context) {
      var name, data, $parent, i, res;

      name = form.name !== null
        ? form.name
        : ('__with__' + Math.floor(Math.random() * (9999999 - 1000000) + 1000000));

      data = self.evalForm(form.path, context);

      $parent = self.context;
      self.namespace[name] = new MananaNamespace(name, data, $parent);
      self.context = self.namespace[name];

      if ( ! isNull(form.body)) {
        i = 0; 
        res = '';
        while ( ! is(form.body[i], "undefined")) {
          res += self.evalForm(form.body[i], self.context);
          i++;
        }
      }

      delete self.namespace[name];

      self.context = $parent;

      return res;
    }; // end Manana.With()

    // ...........................................  
    this.Alias = function(form, context) {
      var name, data;

      if ( ! self.isNamespace(context)) {
        throw new MananaError("Invalid context passed to Alias method. Must be a valid namespace.");
      }

      if ( ! is(context[name], "undefined")) {
        throw new MananaError("Can't alias '{id}'. Name already taken in current context.".strFmt(form));
      }

      name = form.id;
      data = self.evalForm(form.path, context);

      self.namespace[name] = data;
      self.aliases.push(name);

      return '';
    }; // end Manana.Alias()

    // ...........................................  
    this.Unalias = function(form, context) {
      var id;

      id = self.evalForm(form.id, context);

      if (is(self.namespace[id], 'undefined'))
        throw new MananaError('Unknown alias "{id}". Can not unalias.'.strFmt(form));

      delete self.namespace[id];

      return '';
    }; // end Manana.Unalias()

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

            if (isArr(value[1]) || isStr(value[1])) {
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
    this.Switch = function(form, context) {
      var control, i, c, j, len, value, res;

      control = self.evalForm(form.control, context);

      res = '';

      i = 0; 
      while (c = form.cases[i]) {
        ++i;

        value = self.evalForm(c.value, context);

        if (value == control) {
          len = c.block.length;
          for (j = 0; j < len; j++) {
            res += self.evalForm(c.block[j], context);
          }
        }
      }

      if ( ! res.length && form.else_case) {
        i = 0;
        while (c = form.else_case[i]) { 
          ++i;
          res += self.evalForm(c, context);
        }
      }

      return res;
    }; // end Manana.Switch()

    // ...........................................  
    this.For = function(form, context) {
      var name, loop_name, $parent, scope, local_scope, key, count, total, _is_obj, res;

      function iterate() {
        var i;

        ++count;

        self.namespace[name] = new MananaNamespace(name, scope.data[key], $parent);
        local_scope = self.namespace[name];

        local_scope.$count    = count;
        local_scope.$total    = total;
        local_scope.$is_first = count == 1;
        local_scope.$is_last  = count == total;

        if (_is_obj) {
          local_scope.$key = key;
        } else {
          local_scope.$index    = key;
          local_scope.$previous = scope[key-1] || null;
          local_scope.$next     = scope[key+1] || null;
        }

        self.context = local_scope;  

        if ( ! isNull(form.body)) {
          i = 0;
          while ( ! is(form.body[i], "undefined")) {
            if (self.break_loop) {
              cleanUpLoop();
              break;
            }
         
            if (self.continue_loop)
              continue;
         
            res += self.evalForm(form.body[i], local_scope); 
         
            i++;
          }
        }
      }

      function cleanUpLoop() {
        delete self.namespace[loop_name];
        delete self.namespace[name];
        self.in_loop = false;
        self.break_loop = false;
        self.continue_loop = false;
      }

      $parent = self.context;

      scope = self.evalForm(form.path, context);
      if (isObj(scope)) {
        _is_obj = true;
      } else if (isArr(scope)) {
        _is_obj = false;
      } else if (isStr(scope)) {
        _is_obj = false;
        scope = scope.split('');
      } else {
        throw new MananaError('Invalid context provided to loop. Must be Hash, List, or String.');
      }

      name = form.id;
      loop_name = '__loop__' + name;

      if ( ! self.isNamespace(scope))
        scope = new MananaNamespace(loop_name, scope, $parent);
      scope = self.namespace[loop_name] = scope;

      total = _is_obj ? Object.size(scope.data) : scope.data.length;
      count = 0;
      self.in_loop = true;

      res = '';
      if (_is_obj) {
        for (key in scope.data) {
          iterate();
        }
      } else {
        for (key = 0; key < total; key++) {
          iterate();
        }
      }

      cleanUpLoop();

      self.context = $parent;

      return res;
    }; // end Manana.For()

    // ...........................................  
    this.Break = function(form, context) {
      if ( ! self.in_loop) {
        throw new MananaError('Break statement can only exist inside loop!', form.loc);
      }
      self.break_loop = true;
      return '';
    }; // end Manana.Break()

    // ...........................................  
    this.Continue = function(form, context) {
      if ( ! self.in_loop) {
        throw new MananaError('Continue statement can only exist inside loop!', form.loc);
      }
      self.continue_loop = true;
      return '';
    }; // end Manana.Continue()
    
    // ...........................................  
    this.MananaString = function(form, context) {
      var i = 0, res = '';

      if ( ! isNull(form.body)) {
        while ( ! is(form.body[i], "undefined")) {
          res += self.evalForm(form.body[i], context);
          i++;
        }
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
          content.attrs += attr_tpl.strFmt(kv); 
          i++; 
        }
      }

      if ( ! isNull(form.body)) {
        i = 0;
        while ( ! is(form.body[i], "undefined")) {
          content.body += self.evalForm(form.body[i], context);
          i++;
        }
      }

      return html.strFmt(content);
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
          content.attrs += attr_tpl.strFmt(kv); 
          i++; 
        }
      }

      content.body = "\n" + form.body.join("\n");

      return html.strFmt(content);
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
          content.attrs += attr_tpl.strFmt({ 
                             key: self.evalForm(form.attrs[i][0], context), 
                             val: self.evalForm(form.attrs[i][1], context)
                           })
          i++; 
        }
      }

      return html.strFmt(content);
    }; // end Manana.VoidTag()

    // ...........................................  
    this.Text = function(form, context) {
      var i, res;
      if ( ! isNull(form.body)) {
        i = 0; 
        res = [];
        while ( ! is(form.body[i], "undefined")) {
          res.push(self.evalForm(form.body[i], context));
          i++;
        }
      }
      return res.join(' ');
    }; // end Manana.Text()

    // ...........................................  
    this.Filter = function(form, context) {
      var i, res;

      if ( ! isNull(form.body)) {
        i = 0; 
        res = [];
        while ( ! is(form.body[i], "undefined")) {
          res.push(self.evalForm(form.body[i], context));
          i++;
        }
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
        return '{p}{t}'.strFmt({p:padding, t:token})
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
      var name, fn, i, args, res, _in_fns, _in_raw_fns;

      name = form.name;

      _in_fns = name in self.fns;
      _in_raw_fns = !_in_fns && name in self.raw_fns;

      if (!_in_fns && !_in_raw_fns) {
        throw new MananaError('Function "{name}" is not defined.'.strFmt(form));
      }

      fn = self.fns[name] || self.raw_fns[name];

      if ( ! is(fn, "function")) {
        throw new MananaError("'{name}' is not a function".strFmt(form));
      }

      if (_in_raw_fns) {
        args = form.args;
      } else {
        args = [];
        if (form.args) {
          i = 0;
          while ( ! is(form.args[i], "undefined")) {
            args.push(self.evalForm(form.args[i], context));
            i++;
          }
        }
      }

      try {
        res = fn.apply(self, args);
      } catch (e) {
        throw new MananaError(e, form.loc);
      }

      return res;
    }; // end Manana.Function()

    // ...........................................  
    self.fns.len = function(value) {
      if (isObj(value))
        return Object.size(value);
      else if (isArr(value) || isStr(value))
        return value.length;
      else if (isNum(value))
        return value.toString().length;
      throw new MananaError('Invalid value in Len function. Must be Hash, List, String, or Number');
    }; // end Manana.len()

    // ...........................................  
    self.fns.debug = function(form) {
      console.log('view: ', self.view);
      console.log('context: ', self.context);
      console.log('Manana: ', self);
      return '';
    }; // end Manana.debug()

    // ...........................................  
    self.fns.print = function(form) {
      var res = '', i = 0;
      while ( ! is(arguments[i], "undefined")) {
        res += JSON.stringify(arguments[i], null, 4);
        i++;
      }
      return res;
    }; // end Manana.print()

    // ...........................................  
    self.fns.log = function(form) {
      console.log(form);
      return '';
    }; // end Manana.log()

    // ...........................................  
    self.fns.context = function(form) {
      return JSON.stringify(self.context);
    }; // end Manana.context()

    // ...........................................  
    self.fns.view = function(form) {
      var out = JSON.stringify(self.view, null, 4).split("\n")
      out.unshift("<pre>");
      out.push("</pre>");
      return out.join("\n    ");
    }; // end Manana.view()

    // ...........................................  
    self.fns.whatis = function(x) {
      console.log('@whatis: ', x);
      return '<pre>' + JSON.stringify(x, null, 4) + '</pre>';
    };

    // ...........................................  
    self.raw_fns.first_valid = function() {
      var i, arg; 
      
      i = 0;
      while (arg = arguments[i]) {
        ++i;
        try {
          return manana.evalForm(arg, manana.context);
        } catch (e) {
          continue;
        }
      } 
      
      throw new MananaError("No valid argument in First Of function.");
    }; // end Manana.first_valid()

    // ...........................................  
    this.addFunction = function(name, fn) {
      if ( ! isStr(name)) {
        throw new MananaError("1st arg to Manana.add_fn() must be a string");
      }

      if (name in self.raw_fns) {
        throw new MananaError('Function "' + name + '" already exists!');
      }

      if ( ! is(fn, "function")) {
        throw new MananaError("2nd arg to Manana.add_fn() must be a function");
      }

      self.fns[name] = fn;
    }; // end Manana.add_fn()

    // ...........................................  
    this.addRawFunction = function(name, fn) {
      if ( ! isStr(name)) {
        throw new MananaError("1st arg to Manana.add_raw_fn() must be a string");
      }

      if (name in self.fns) {
        throw new MananaError('Function "' + name + '" already exists!');
      }

      if ( ! is(fn, "function")) {
        throw new MananaError("2nd arg to Manana.add_raw_fn() must be a function");
      }

      self.raw_fns[name] = fn;
    }; // end Manana.add_raw_fn()

    // switching to camelcase, leaving for backward compatability
    this.add_fn     = this.addFunction; 
    this.add_raw_fn = this.addRawFunction; 

  } // end Manana() 


  // _____________________________________________ Make available in both node.js & browser 
  if (_manana_is_server_side) {
    exports['Manana'] = Manana;
    exports['MananaNamespace'] = MananaNamespace;
    exports['MananaView'] = MananaView;
    exports['MananaError'] = MananaError;
  }

  if (typeof window === 'undefined') {
    window = {};
  }
  window['Manana'] = Manana;
  window['MananaNamespace'] = MananaNamespace;
  window['MananaView'] = MananaView;
  window['MananaError'] = MananaError;

})(typeof exports === "undefined" ? {} : exports);
