/* ******************************************************
 * Author: Chad Angelelli <chad@angelel.li>
 * Contributors/Special Thanks:
 *    Ray Harris <ray@harris.net>
 *    Mason Armour <mason@myshorttrack.com>
 *    Chris Hacker <chris@myshorttrack.com>
 *    Brigette LeVert <brigette.levert@gmail.com>
 * ******************************************************/

/**
 * The Mañana Templating Language
 * @version 1.0
 * @exports Manana
 */
(function(exports) {
  var _manana_is_server_side, _manana_is_client_side;

  // _____________________________________________ Configuration
  _manana_is_server_side =  typeof require        !== 'undefined' && 
                            typeof module         !== 'undefined' && 
                            typeof module.exports !== 'undefined' ;

  _manana_is_client_side = !_manana_is_server_side;


 
  // _____________________________________________ Mañana
  /**
   * Manana
   * @class Manana
   * @param {string} [view_dir] - View Directory if using server-side
   */
  function Manana(view_dir) {
    var self = this;

    // ........................................... 
    this.name                   = '';
    this.template               = '';
    this.ir                     = '';
    this.result                 = '';
    this.context                = {};
    this.aliases                = [];
    this.namespace              = {};
    this.interpreter            = {}; // low-level methods for converting AST nodes to output
    this.marshal                = {}; // marshaling methods for transporting views/contexts
    this.text                   = {}; // input/output methods for converting text
    this.view                   = {}; // the current view object
    this.views                  = {}; // a cache of all known views
    this.view_level             = 0;
    this.ancestry               = [];
    this.fns                    = {};
    this.raw_fns                = {};
    this.is_server_side         = _manana_is_server_side;
    this.is_client_side         = ! _manana_is_server_side;
    this.in_loop                = false;
    this.break_loop             = false;
    this.continue_loop          = false;
    this.err                    = null;
    this._silence_error_logging = false;

    // ........................................... 
    /**
     * A Mañana Namespace
     * @class MananaNamespace
     * @param {string} name - The name of the Namespace
     * @param {*} data - The data that is available to the view
     * @param {MananaNamespace|null} $parent - The parent Namespace
     */
    function MananaNamespace(name, data, $parent) {
      this.type = 'MananaNamespace';
      this.name = name;
      this.data = data;
      this.$parent = $parent;
    } // end MananaNamespace()
 
    // ........................................... 
    /**
     * A Mañana View Object
     * @class MananaView
     * @param {Object} args - The paramaters to set up a MananaView
     * @param {string} args.name - The name of the view
     * @param {string} args.template - The source code for the template
     * @param {Mixed} args.context - The context for the MananaView
     * @param {MananaView} args.$parent - The ancestral parent MananaView
     */
    function MananaView(args) {
      this.name     = args.name;
      this.template = args.template;
      this.context  = args.context;
      this.$level   = args.$level; 
      this.$parent  = args.$parent;
    } // end MananaView()
 
    // ........................................... 
    /**
     * A Mañana Error
     * @class MananaError
     * @param {string} message - The error message
     * @param {Object} [loc] - A Manana.ast.Loc node
     */
    function MananaError(message, loc) {
      this.name = "MananaError";
      this.message = message;
      this.loc = loc;

      if ( ! self._silence_error_logging) {
        console.log('MananaError');
        console.log('\ttemplate: ', self.view.name);
        console.log('\tmessage: ', message);

        if (is(loc, 'undefined')) {
          console.log('\t-- no line/column information provided');
        } else {
          console.log('\tline: ', loc.start.line);
          console.log('\tcolumn: ', loc.start.column, '-', loc.end.column);
        }

        console.log('\tview object: ', self.view);
      }
    } // end MananaError()

    // ...........................................  Validation shorthand and helpers
    function is(v, t)  { return typeof v === t; }
    function isNull(v) { return v === null; }
    function isStr(v)  { return is(v, "string"); }
    function isNum(v)  { return is(v, "number"); }
    function isInt(v)  { return is(v, "number") && parseFloat(v) == parseInt(v, 10) && ! isNaN(v); }
    function isArr(v)  { return Object.prototype.toString.call(v) === '[object Array]'; }
    function isObj(v)  { return Object.prototype.toString.call(v) === '[object Object]'; }
 
    function strFmt(s, o) {
      return s.replace(/{([^{}]*)}/g, function(a, b) { 
        var r = o[b]; 
        return isStr(r) || isNum(r) ? r : a; 
      });
    };
 
    function repeatStr(s, n) {
      return new Array(n + 1).join(s);
    };
 
    function objectSize(obj) {
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
    /**
     * Read a template from disk, or script from DOM
     * @memberof Manana
     * @method getTemplate
     * @param {string} name - The name of the template
     */
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
          self.err = new MananaError(strFmt("Invalid name '{p}' provided to getTemplate function", {p:name}));
          throw self.err;
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
        self.err = new MananaError(strFmt("Template '{n}' has no content.", {n:name}));
        throw self.err
      }

      return template;
    }; // end Manana.getTemplate()

    // ...........................................  
    /**
     * Render a template
     * @memberof Manana
     * @method render
     * @param {string} name - The name of the template
     * @param {*} [context={}] - A non-falsy value to be passed into the template
     * @param {Object} [options={}] - Optional options for rendering
     */
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
        r = self.interpreter.evalForm(form, self.context);
        self.result += isObj(r) ? JSON.stringify(r) : r;
        i++;
      }

      if (is(options, "undefined")) {
        options = {};
      }

      options.return_single_line = options.return_single_line || false;
      options.encode = options.encode || false;

      if ( ! options.return_single_line) {
        self.result = self.text.format(self.result, "  ", 0);
      }

      if (options.encode) {
        self.result = self.text.encode(self.result);
      }

      i = 0;
      while (self.aliases[i]) {
        i++;
        delete self.namespace[self.aliases[i]];
      }

      return self.result;
    }; // end Manana.render()

    // _____________________________________________ Built-in functions
    /**
     * Interpreter Methods
     * @memberof Manana
     * @type {object}
     * @namespace Manana.interpreter
     */

    // ...........................................  
    /**
     * Low-level method to evaluate a Mañana AST Node
     * @memberof Manana.interpreter
     * @method evalForm
     * @param {Object} form - A Mañana AST node 
     * @param {*} context - A value to be passed as the context for a view
     */
    this.interpreter.evalForm = function(form, context) {
      var res = '', i;

      if (form && (form.type == 'Path' || form.type == 'Function')) {
        return self.interpreter[form.type](form, context);

      } else if (isObj(form) && ! is(form.type, "undefined")) {
        res += self.interpreter[form.type](form, context);

      } else if (isArr(form)) {
        i = 0;
        while ( ! is(form[i], "undefined")) {
          res += self.interpreter.evalForm(form[i], context);
          i++;
        }
      } else {
        res = form;
      }

      return res;
    }; // end Manana.interpreter.evalForm()

    // ...........................................  
    /**
     * Include a sub-template into current, using same context
     * @memberof Manana.interpreter
     * @method Include
     * @param {Object} form - A Mañana.ast.IncludeNode 
     * @param {*} context - A value to be passed as the context for a view
     */
    this.interpreter.Include = function(form, context) {
      var name, template, ir, $parent, i, form, res;

      name = self.interpreter.evalForm(form.path, context);
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
        res += self.interpreter.evalForm(form, context);
        i++;
      }

      self.view = $parent;
      self.view_level--;

      return res;
    }; // end Manana.Include()

    // ...........................................  
    /**
     * Resolve a path for an expression, argument, or name
     * @memberof Manana.interpreter
     * @method Path
     * @param {Object} form - A Mañana.ast.PathNode 
     * @param {*} context - A value to be passed as the context for a view
     */
    this.interpreter.Path = function(form, context) {
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
          self.err = new MananaError("Invalid path: $window is not defined", form.loc);
          throw self.err;
        }
      }

      i = 0;
      while ( ! is(components[i], "undefined")) {
        target = self.interpreter.evalForm(components[i][0], context);
        index  = self.interpreter.evalForm(components[i][1], context);
        slice  = self.interpreter.evalForm(components[i][2], context);

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
              self.err = new MananaError('Could not find path in ancestry: "' + traceback.join('.') + '"', form.loc);
              throw self.err;
            }

          } else {
            self.err = new MananaError('Invalid path in namespace: "' + traceback.join('.') + '"', form.loc);
            throw self.err;
          }

        } else if ( ! is(node, 'undefined')) { 
          if ( ! is(node[target], "undefined")) {
            node = node[target];
          } else {
            self.err = new MananaError('Invalid path: "' + traceback.join('.') + '"', form.loc);
            throw self.err;
          }

        } else {
          self.err = new MananaError("Undefined path: " + traceback.join('.'), form.loc);
          throw self.err;
        }

        //................ 
        if ( ! is(slice, 'undefined')) {
          if (isStr(node)) {
            node = node.split('');
          } else if ( ! isArr(node)) {
            self.err = new MananaError('slicing attempted on non-list: ' + traceback.join('.'), form.loc);
            throw self.err;
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
            self.err = new MananaError(strFmt("Undefined method '{name}' called: ", meth) + traceback.join('.'), meth.loc);
            throw self.err;
          }

          if ( ! is(node[meth.name], 'function')) {
            self.err = new MananaError(
              strFmt("Requested method '{name}' is not a function.", meth) + traceback.join('.'), 
              meth.loc);
            throw self.err;
          }

          try {
            if (isArr(meth.args) && meth.args.length) {
              node = node[meth.name].apply(self, meth.args);
            } else {
              node = node[meth.name]();
            }
          } catch (e) {
            self.err = new MananaError(e, meth.loc);
            throw self.err;
          }
          i++;
        }
      }

      //................ 
      if (is(node, 'undefined')) {
        self.err = new MananaError("Can't find path: " + traceback.join('.'), form.loc);
        throw self.err;
      }

      //................ 
      return node;
    }; // end Interprteter.Path()

    // ...........................................  
    /**
     * Resolve a path for an expression, argument, or name
     * @memberof Manana.interpreter
     * @method Name
     * @param {Object} form - A Mañana.ast.NameNode 
     * @param {*} context - A value to be passed as the context for a view
     */
    this.interpreter.Name = function(form, context) {
      var res;

      if ('default_value' in form && !isNull(form.default_value)) {
        try {
          self._silence_error_logging = true;
          res = self.interpreter.evalForm(form.path, context);
          self._silence_error_logging = false;
        } catch (e) {
          self._silence_error_logging = false;
          res = self.interpreter.evalForm(form.default_value, context);
        }
      } else {
        res = self.interpreter.evalForm(form.path, context);
      }

      return res;
    }; // end Interpreter.Name()

    // ........................................... 
    /**
     * Create a temporary MananaNamespace to use for the duration of a block
     * @memberof Manana.interpreter
     * @method With
     * @param {Object} form - A Mañana.ast.WithNode 
     * @param {*} context - A value to be passed as the context for a view
     */
    this.interpreter.With = function(form, context) {
      var name, data, $parent, i, res;

      name = form.name !== null
        ? form.name
        : ('__with__' + Math.floor(Math.random() * (9999999 - 1000000) + 1000000));

      data = self.interpreter.evalForm(form.path, context);

      $parent = self.context;
      self.namespace[name] = new MananaNamespace(name, data, $parent);
      self.context = self.namespace[name];

      if ( ! isNull(form.body)) {
        i = 0; 
        res = '';
        while ( ! is(form.body[i], "undefined")) {
          res += self.interpreter.evalForm(form.body[i], self.context);
          i++;
        }
      }

      delete self.namespace[name];

      self.context = $parent;

      return res;
    }; // end Manana.With()

    // ...........................................  
    /**
     * Create a MananaNamespace that persists
     * @memberof Manana.interpreter
     * @method Alias
     * @param {Object} form - A Mañana.ast.AliasNode 
     * @param {*} context - A value to be passed as the context for a view
     */
    this.interpreter.Alias = function(form, context) {
      var name, data;

      if ( ! self.isNamespace(context)) {
        self.err = new MananaError("Invalid context passed to Alias method. Must be a valid namespace.", form.loc);
        throw self.err;
      }

      if ( ! is(context[name], "undefined")) {
        self.err = new MananaError(strFmt("Can't alias '{id}'. Name already taken in current context.", form.loc));
        throw self.err;
      }

      name = form.id;
      data = self.interpreter.evalForm(form.path, context);

      self.namespace[name] = data;
      self.aliases.push(name);

      return '';
    }; // end Manana.Alias()

    // ...........................................  
    /**
     * Remove a MananaNamespace created by Alias
     * @memberof Manana.interpreter
     * @method Unalias
     * @param {Object} form - A Mañana.ast.UnaliasNode 
     * @param {*} context - A value to be passed as the context for a view
     */
    this.interpreter.Unalias = function(form, context) {
      var id;

      id = self.interpreter.evalForm(form.id, context);

      if (is(self.namespace[id], 'undefined')) {
        self.err = new MananaError(strFmt('Unknown alias "{id}". Can not unalias.', form.loc));
        throw self.err;
      }

      delete self.namespace[id];

      return '';
    }; // end Manana.Unalias()

    // ...........................................  
    /**
     * Conditional operator used to evaluate true or false
     * @memberof Manana.interpreter
     * @method If
     * @param {Object} form - A Mañana.ast.IfNode 
     * @param {*} context - A value to be passed as the context for a view
     */
    this.interpreter.If = function(form, context) {
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
            value[0] = self.interpreter.evalForm(value[0], context);

            if (value[0]) {
              outcome = true;
            } else {
              outcome = false;
            }

            if (operator == 'not_true') {
              outcome = ! outcome;
            }

          } else if (operator == 'exists' || operator == 'not_exists') {
            self._silence_error_logging = true;
            try {
              value[0] = self.interpreter.evalForm(value[0], context);
              outcome = true;
            } catch (e) {
              outcome = false;
            }
            self._silence_error_logging = false;

            if (operator == 'not_exists') {
              outcome = ! outcome;
            }

          } else if (operator == 'in' || operator == 'not_in') {
            value[0] = self.interpreter.evalForm(value[0], context);
            value[1] = self.interpreter.evalForm(value[1], context);

            if (isArr(value[1]) || isStr(value[1])) {
              outcome = value[1].indexOf(value[0]) > -1;
            } else if (isObj(value[1])) {
              outcome = value[0] in value[1];
            }

            if (operator == 'not_in') {
              outcome = ! outcome;
            }

          } else if (operator == 'is' || operator == 'not_is') {
            value[0] = self.interpreter.evalForm(value[0], context);

            if      (value[1] == 'Hash'   ) outcome = isObj(value[0]);
            else if (value[1] == 'List'   ) outcome = isArr(value[0]);
            else if (value[1] == 'String' ) outcome = isStr(value[0]);
            else if (value[1] == 'Number' ) outcome = isNum(value[0]);
            else if (value[1] == 'Integer') outcome = isInt(value[0]);

            if (operator == 'not_is') {
              outcome = ! outcome;
            } 

          } else {
            value[0] = self.interpreter.evalForm(value[0], context);
            value[1] = self.interpreter.evalForm(value[1], context);

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
          res = self.interpreter.evalForm(c.body, context);
          break;
        }

        i++;
      } // end while(if/elif)

      if ( ! outcome && else_case) {
        res = self.interpreter.evalForm(else_case.body, context);
      }

      if (is(res, 'undefined')) {
        res = '';
      }

      return res;
    }; // end Manana.If()

    // ...........................................  
    /**
     * Mañana switch-statement
     * @memberof Manana.interpreter
     * @method Switch
     * @param {Object} form - A Mañana.ast.SwitchNode 
     * @param {*} context - A value to be passed as the context for a view
     */
    this.interpreter.Switch = function(form, context) {
      var control, i, c, j, len, value, res;

      control = self.interpreter.evalForm(form.control, context);

      res = '';

      i = 0; 
      while (c = form.cases[i]) {
        ++i;

        value = self.interpreter.evalForm(c.value, context);

        if (value == control) {
          len = c.block.length;
          for (j = 0; j < len; j++) {
            res += self.interpreter.evalForm(c.block[j], context);
          }
        }
      }

      if ( ! res.length && form.else_case) {
        i = 0;
        while (c = form.else_case[i]) { 
          ++i;
          res += self.interpreter.evalForm(c, context);
        }
      }

      return res;
    }; // end Manana.Switch()

    // ...........................................  
    /**
     * Mañana loop-construct
     * @memberof Manana.interpreter
     * @method For
     * @param {Object} form - A Mañana.ast.ForNode 
     * @param {*} context - A value to be passed as the context for a view
     */
    this.interpreter.For = function(form, context) {
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
         
            res += self.interpreter.evalForm(form.body[i], local_scope); 
         
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

      scope = self.interpreter.evalForm(form.path, context);
      if (isObj(scope)) {
        _is_obj = true;
      } else if (isArr(scope)) {
        _is_obj = false;
      } else if (isStr(scope)) {
        _is_obj = false;
        scope = scope.split('');
      } else {
        self.err = new MananaError('Invalid context provided to loop. Must be Hash, List, or String.', form.loc);
        throw self.err;
      }

      name = form.id;
      loop_name = '__loop__' + name;

      if ( ! self.isNamespace(scope))
        scope = new MananaNamespace(loop_name, scope, $parent);
      scope = self.namespace[loop_name] = scope;

      total = _is_obj ? objectSize(scope.data) : scope.data.length;
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
    /**
     * Break a loop
     * @memberof Manana.interpreter
     * @method Break
     * @param {Object} form - A Mañana.ast.BreakNode 
     * @param {*} context - A value to be passed as the context for a view
     */
    this.interpreter.Break = function(form, context) {
      if ( ! self.in_loop) {
        self.err = new MananaError('Break statement can only exist inside loop!', form.loc);
        throw self.err;
      }
      self.break_loop = true;
      return '';
    }; // end Manana.Break()

    // ...........................................  
    /**
     * Continue a loop
     * @memberof Manana.interpreter
     * @method Continue
     * @param {Object} form - A Mañana.ast.ContinueNode 
     * @param {*} context - A value to be passed as the context for a view
     */
    this.interpreter.Continue = function(form, context) {
      if ( ! self.in_loop) {
        self.err = new MananaError('Continue statement can only exist inside loop!', form.loc);
        throw self.err;
      }
      self.continue_loop = true;
      return '';
    }; // end Manana.Continue()
    
    // ...........................................  
    /**
     * A Mañana string, possibly containing interpolated paths
     * @memberof Manana.interpreter
     * @method MananaString
     * @param {Object} form - A Mañana.ast.MananaStringNode 
     * @param {*} context - A value to be passed as the context for a view
     */
    this.interpreter.MananaString = function(form, context) {
      var i = 0, res = '';

      if ( ! isNull(form.body)) {
        while ( ! is(form.body[i], "undefined")) {
          res += self.interpreter.evalForm(form.body[i], context);
          i++;
        }
      }

      return res;
    } // end Manana.MananaString()

    // ...........................................  
    /**
     * An HTML tag
     * @memberof Manana.interpreter
     * @method Tag
     * @param {Object} form - A Mañana.ast.TagNode 
     * @param {*} context - A value to be passed as the context for a view
     */
    this.interpreter.Tag = function(form, context) {
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
            kv.key = self.interpreter.evalForm(form.attrs[i][0], context);
          } 
          kv.val = self.interpreter.evalForm(form.attrs[i][1], context); 
          content.attrs += strFmt(attr_tpl, kv); 
          i++; 
        }
      }

      if ( ! isNull(form.body)) {
        i = 0;
        while ( ! is(form.body[i], "undefined")) {
          content.body += self.interpreter.evalForm(form.body[i], context);
          i++;
        }
      }

      return strFmt(html, content);
    }; // end Manana.Tag()

    // ...........................................  
    /**
     * An HTML pre or code tag
     * @memberof Manana.interpreter
     * @method CodeTag
     * @param {Object} form - A Mañana.ast.CodeTagNode 
     * @param {*} context - A value to be passed as the context for a view
     */
    this.interpreter.CodeTag = function(form, context) {
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
            kv.key = self.interpreter.evalForm(form.attrs[i][0], context);
          } 
          kv.val = self.interpreter.evalForm(form.attrs[i][1], context); 
          content.attrs += strFmt(attr_tpl, kv); 
          i++; 
        }
      }

      content.body = "\n" + form.body.join("\n");

      return strFmt(html, content);
    }; // end Manana.PreTag()

    // ...........................................  
    /**
     * An HTML void tag
     * @memberof Manana.interpreter
     * @method VoidTag
     * @param {Object} form - A Mañana.ast.VoidTagNode 
     * @param {*} context - A value to be passed as the context for a view
     */
    this.interpreter.VoidTag = function(form, context) {
      var html, attr_tpl, content, i;

      html = '<{tag}{attrs}>';
      attr_tpl = ' {key}="{val}"';
      content = { tag: form.tag, attrs: '' };

      if (isArr(form.attrs)) {
        i = 0;
        while (form.attrs[i]) {
          content.attrs += strFmt(attr_tpl, { 
                             key: self.interpreter.evalForm(form.attrs[i][0], context), 
                             val: self.interpreter.evalForm(form.attrs[i][1], context)
                           });
          i++; 
        }
      }

      return strFmt(html, content);
    }; // end Manana.VoidTag()

    // ...........................................  
    /**
     * Text, possibly containing interpolated paths
     * @memberof Manana.interpreter
     * @method Text
     * @param {Object} form - A Mañana.ast.TextNode 
     * @param {*} context - A value to be passed as the context for a view
     */
    this.interpreter.Text = function(form, context) {
      var i, res;
      if ( ! isNull(form.body)) {
        i = 0; 
        res = [];
        while ( ! is(form.body[i], "undefined")) {
          res.push(self.interpreter.evalForm(form.body[i], context));
          i++;
        }
      }
      return res.join(' ');
    }; // end Manana.Text()

    // ...........................................  
    /**
     * Switches parser into "filter mode", allowing block text (by default) or another language injected
     * @memberof Manana.interpreter
     * @method Filter
     * @param {Object} form - A Mañana.ast.FilterNode 
     * @param {*} context - A value to be passed as the context for a view
     */
    this.interpreter.Filter = function(form, context) {
      var i, res;

      if ( ! isNull(form.body)) {
        i = 0; 
        res = [];
        while ( ! is(form.body[i], "undefined")) {
          res.push(self.interpreter.evalForm(form.body[i], context));
          i++;
        }
      }
      return res.join(' ');
    }; // end Manana.Filter()

    // _____________________________________________ Validation
    /**
     * Validation methods
     * @memberof Manana
     * @type {object}
     * @namespace Manana.validation
     */

    // ...........................................  
    /**
     * Declare if a node is of type MananaNamespace
     * @memberof Manana.validation
     * @method isNamespace
     * @param {*} node - A value to check
     */
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

    // _____________________________________________ Text Manipulation
    /**
     * Text Manipulation Methods
     * @memberof Manana
     * @type {object}
     * @namespace Manana.text
     */

    // ...........................................  
    /**
     * Format HTML output from Manana.Render
     * @memberof Manana.text
     * @method format
     * @param {string} html - The HTML to be formatted
     * @param {string} indent - The string to be used for indentation
     * @param {Number} indent_level - The indentation level to be used
     * @param {Object} loc - The location (row, col) of the text
     */
    this.text.format = function(html, indent, indent_level, loc) {
      var orig_indent_level, tokens, extract_close_tag, open_tags, void_tags, padding, tag, i, t, r;

      if (is(html, "undefined")) {
        self.err = new MananaError("format() functions requires render() to be run first");
        throw self.err;
      }

      if (is(indent, "undefined")) {
        self.err = new MananaError("format() requires and indentation string for its 2nd arg.");
        throw self.err;
      }

      if (is(indent_level, "undefined")) {
        indent_level = 0;
      }

      function line(token, indent_plus_one) {
        if ( ! is(indent_plus_one, "undefined")) {
          padding = repeatStr(indent, indent_level + 1);
        } else {
          padding = repeatStr(indent, indent_level);
        }
        return strFmt('{p}{t}', {p:padding, t:token})
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
    }; // end Manana.text.format()

    // ...........................................  
    /**
     * Format HTML output from Manana.Render
     * @memberof Manana.text
     * @method encode
     * @param {string} html - The HTML to be formatted
     */
    this.text.encode = function(html) {
      return String(html)
               .replace( /&/g, '&amp;'  )
               .replace( /"/g, '&quot;' )
               .replace( /'/g, '&#39;'  )
               .replace( /</g, '&lt;'   )
               .replace( />/g, '&gt;'   );
    }; // end Manana.text.encode()

    // ...........................................  
    /**
     * Format HTML output from Manana.encode
     * @memberof Manana.text
     * @method decode
     * @param {string} html - The HTML to be formatted
     */
    this.text.decode = function(encoded) {
      return String(encoded)
               .replace( /&amp;/g  , '&' )
               .replace( /&quot;/g , '"' )
               .replace( /&\#39;/g , "'" )
               .replace( /&lt;/g   , '<' )
               .replace( /&gt;/g   , '>' );
    }; // end Manana.text.decode()

    // _____________________________________________ Marshaling
    /**
     * Marshaling Methods
     * @memberof Manana
     * @type {object}
     * @namespace Manana.marshal
     */
    // ...........................................  
    /**
     * Marshal a View and Context for transportation
     * @memberof Manana.marshal
     * @method bottle
     * @param {string} code - The code to be bottled
     * @param {*} context - A value to be passed as the context for a view
     */
    this.marshal.bottle = function(code, context) {
      var i, lines, line, indent_pat, indent, brew;

      if (is(context, "undefined")) {
        context = {};
      }

      try {
        self.parser.parse(code);
      } catch (e) {
        self.err = new MananaError("Invalid Mañana code sent to Bottle method.");
        throw self.err;
      }

      try {
        JSON.parse(JSON.stringify(context));
      } catch (e) {
        self.err = new MananaError("Invalid context sent to Bottle method.");
        throw self.err;
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
    /**
     * UnMarshal a View and Context bottled by Manana.bottle
     * @memberof Manana.marshal
     * @method pour
     * @param {string} brew - The bottle produced by Manana.bottle
     * @param {string} indent_char - The indent string to be used to reformat the source code
     */
    this.marshal.pour = function(brew, indent_char) {
      var parts, tpl, ctx, i, lines, line, indent;

      if ( ! /^\#ñ\(role="template"\)(?=\#ñ\{)/.test(brew)) {
        self.err = new MananaError("Invalid brew provided to Unbottle method.");
        throw self.err;
      }

      brew = brew.replace('#ñ(role="template")', '');
      parts = brew.split('#ñ(role="context")');
      tpl = parts[0];
      ctx = parts[1];

      try {
        ctx = JSON.parse(ctx);
      } catch (e) {
        self.err = new MananaError("Invalid context provided to Unbottle method.");
        throw self.err;
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
        indent = repeatStr(indent_char, parseInt(indent));

        line = lines[i + 1];

        tpl += indent + line + "\n";
      }

      try {
        self.parser.parse(tpl);
      } catch (e) {
        self.err = new MananaError("Invalid Mañana code pourd..");
        throw self.err;
      }

      return { "template": tpl, "context": ctx }
    }; // end Manana.pour()

    // ...........................................  
    /**
     * Call a function inside a view
     * @memberof Manana.interpreter
     * @method Function
     * @param {Object} form - A Mañana.ast.FunctionNode 
     * @param {*} context - A value to be passed as the context for a view
     */
    this.interpreter.Function = function(form, context) {
      var name, fn, i, args, res, _in_fns, _in_raw_fns;

      name = form.name;

      _in_fns = name in self.fns;
      _in_raw_fns = !_in_fns && name in self.raw_fns;

      if (!_in_fns && !_in_raw_fns) {
        self.err = new MananaError(strFmt('Function "{name}" is not defined.', form.loc));
        throw self.err;
      }

      fn = self.fns[name] || self.raw_fns[name];

      if ( ! is(fn, "function")) {
        self.err = new MananaError(strFmt('"{name}" is not a function', form.loc));
        throw self.err;
      }

      if (_in_raw_fns) {
        args = form.args;
      } else {
        args = [];
        if (form.args) {
          i = 0;
          while ( ! is(form.args[i], "undefined")) {
            args.push(self.interpreter.evalForm(form.args[i], context));
            i++;
          }
        }
      }

      try {
        res = fn.apply(self, args);
      } catch (e) {
        self.err = new MananaError(e, form.loc);
        throw self.err;
      }

      return res;
    }; // end Manana.Function()

    // ...........................................  
    this.addFunction = function(name, fn) {
      if ( ! isStr(name)) {
        self.err = new MananaError("1st arg to Manana.add_fn() must be a string");
        throw self.err
      }

      if (name in self.raw_fns) {
        self.err = new MananaError('Function "' + name + '" already exists!');
        throw self.err
      }

      if ( ! is(fn, "function")) {
        self.err = new MananaError("2nd arg to Manana.add_fn() must be a function");
        throw self.err
      }

      self.fns[name] = fn;
    }; // end Manana.addFunction()

    // ...........................................  
    this.addRawFunction = function(name, fn) {
      if ( ! isStr(name)) {
        self.err = new MananaError("1st arg to Manana.add_raw_fn() must be a string");
        throw self.err
      }

      if (name in self.fns) {
        self.err = new MananaError('Function "' + name + '" already exists!');
        throw self.err
      }

      if ( ! is(fn, "function")) {
        self.err = new MananaError("2nd arg to Manana.add_raw_fn() must be a function");
        throw self.err
      }

      self.raw_fns[name] = fn;
    }; // end Manana.addRawFunction()

    // ...........................................  
    // switching to camelcase, leaving for backward compatability
    this.add_fn = this.addFunction; 
    this.add_raw_fn = this.addRawFunction; 



    // _____________________________________________ Built-in functions
    /**
     * Built-in functions
     * @memberof Manana
     * @type {object}
     * @namespace Manana.fns 
     */

    // ...........................................  
    /**
     * Get the length (size) of a Hash, List, String, or Number
     * @memberof Manana.fns
     * @method len
     * @param {Hash|List|String|Number} value - A value that has a lenght/size
     */
    self.fns.len = function(value) {
      if (isObj(value))
        return objectSize(value);
      else if (isArr(value) || isStr(value))
        return value.length;
      else if (isNum(value))
        return value.toString().length;

      self.err = new MananaError('Invalid value in Len function. Must be Hash, List, String, or Number');
      throw self.err;
    }; // end Manana.len()

    // ...........................................  
    /**
     * Log current View, Context, and the Manana interpreter to console
     * @memberof Manana.fns
     * @method debug
     * @param {Object} form - A Mañana AST node 
     */
    self.fns.debug = function(form) {
      console.log('view: ', self.view);
      console.log('context: ', self.context);
      console.log('Manana: ', self);
      return '';
    }; // end Manana.debug()

    // ...........................................  
    /**
     * Print one or more values in the current view
     * @memberof Manana.fns
     * @method print
     * @param {*} arguments... - One or more arguments to print
     */
    self.fns.print = function() {
      var res = '', i = 0;
      while ( ! is(arguments[i], "undefined")) {
        res += JSON.stringify(arguments[i], null, 4);
        i++;
      }
      return res;
    }; // end Manana.print()

    // ...........................................  
    /**
     * Log a value to the console
     * @memberof Manana.fns
     * @method log
     * @param {*} value - Any value
     */
    self.fns.log = function(value) {
      console.log(value);
      return '';
    }; // end Manana.log()

    // ...........................................  
    /**
     * Print the current context to the view
     * @memberof Manana.fns
     * @method context
     */
    self.fns.context = function(_pretty) {
      return '<pre>\n' + JSON.stringify(self.context, null, 4) + '</pre>';
    }; // end Manana.context()

    // ...........................................  
    /**
     * Print the current view inside the view 
     * @memberof Manana.fns
     * @method view
     */
    self.fns.view = function(form) {
      var out = JSON.stringify(self.view, null, 4).split("\n")
      out.unshift("<pre>");
      out.push("</pre>");
      return out.join("\n    ");
    }; // end Manana.view()

    // ...........................................  
    /**
     * Print value to view and log it to console
     * @memberof Manana.fns
     * @method whatis
     * @param {*} value - Any value that should be printed and logged.
     */
    self.fns.whatis = function(value) {
      console.log('@whatis: ', value);
      return '<pre>' + JSON.stringify(value, null, 4) + '</pre>';
    };

    // ...........................................  
    /**
     * Determine the first argument that does not throw an error
     * @memberof Manana.fns
     * @method first_valid
     * @param {*} arguments... - n-number of arguments to evaluate
     */
    self.raw_fns.first_valid = function() {
      var i, arg, res; 
      
      self._silence_error_logging = true;

      i = 0;
      while (arg = arguments[i]) {
        ++i;
        try {
          res = self.interpreter.evalForm(arg, self.context);
          break;
        } catch (e) {
          continue;
        }
      }

      self._silence_error_logging = false;

      if ( ! is(res, 'undefined'))
        return res;
      
      self.err = new MananaError("No valid argument in First Valid function.");
      throw self.err
    }; // end Manana.first_valid()

    // _____________________________________________ Exports
    // export related classes
    exports['MananaNamespace'] = MananaNamespace;
    exports['MananaView'] = MananaView;
    exports['MananaError'] = MananaError;
  } // end Manana() 



  // _____________________________________________ Make available in both node.js & browser 
  if (_manana_is_server_side) {
    exports['Manana'] = Manana;
  }

  if (typeof window === 'undefined') {
    window = {};
  }
  window['Manana'] = Manana;
  window['MananaNamespace'] = exports['MananaNamespace'];
  window['MananaView'] = exports['MananaView'];
  window['MananaError'] = exports['MananaError'];

})(typeof exports === "undefined" ? {} : exports);
