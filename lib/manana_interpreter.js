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
    /**
     * @memberof Manana
     * @property {String} name - View name
     * @property {String} template - Raw Mañana template
     * @property {Array} ir - Mañana intermediate representation
     * @property {String} [result=''] - Final result from evaluating all nodes
     * @property {Mixed} [context={}] - Context passed to interpreter methods
     * @property {MananaView} view - Current MananaView object
     * @property {Array} views - Array of MananaView objects
     * @property {Number} [view_level=0] - View level, increments when "include" is called .
     * @property {Array} ancestry - Array of MananaView objects, added to when "include" is called.
     * @property {MananaError} err - Last error thrown from interpreter
     * @property {Boolean} _is_server_side - Flag
     * @property {Boolean} _is_client_side - Flag
     * @property {Boolean} [_in_loop=false] - Flag to tell interpreter if in Loop State
     * @property {Boolean} [_break_loop=false] - Flag to tell interpreter to break loop
     * @property {Boolean} [_continue_loop=false] - Flag to tell interpreter to continue loop
     * @property {Boolean} [_silence_error_logging=false] - Flag to tell interpreter to log errors or not
     * @property {Boolean} [_format_result=false] - Flag to tell interpreter to format result text
     */ 

    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    this.name       = '';
    this.template   = '';
    this.ir         = '';
    this.result     = '';
    this.context    = {};
    this.view       = {}; // the current view object
    this.view_level = 0;
    this.ancestry   = [];
    this.err        = null;

    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    this._is_server_side        = _manana_is_server_side;
    this._is_client_side        = !_manana_is_server_side;
    this._in_loop               = false;
    this._break_loop            = false;
    this._continue_loop         = false;
    this._silence_error_logging = false;
    this._format_result         = false;

    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    this.format = {}; // options for output format

    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    /**
     * Low-level methods for converting AST nodes to output
     * @memberof Manana
     * @type {object}
     * @namespace Manana.interpreter
     */
    this.interpreter = {}; 

    /**
     * Mañana's Namespaces
     * @memberof Manana
     * @type {object}
     * @namespace Manana.namespace
     */
    this.namespace = {}; 

    /**
     * A cache of all known views
     * @memberof Manana
     * @type {object}
     * @namespace Manana.views
     */
    this.views = {}; 

    /**
     * Text Manipulation Methods
     * @memberof Manana
     * @type {object}
     * @namespace Manana.text
     */
    this.text = {}; 

    /**
     * Marshaling methods for transporting views/contexts
     * @memberof Manana
     * @type {object}
     * @namespace Manana.marshal
     */
    this.marshal = {}; 

    /**
     * Mañana Functions. Built-in or user-defined.
     * @memberof Manana
     * @type {object}
     * @namespace Manana.fns 
     */
    this.fns = {}; 

    /**
     * Mañana Raw Functions. Built-in or user-defined.
     * @memberof Manana
     * @type {object}
     * @namespace Manana.raw_fns 
     */
    this.raw_fns = {}; // Raw functions. Built-in or user-defined.

    /**
     * Validation methods
     * @memberof Manana
     * @type {object}
     * @namespace Manana.validate
     */
    this.validate    = {}; // Validation methods.

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

      if (!self._silence_error_logging) {
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
    function isBool(v) { return is(v, "boolean"); }
    function isStr(v)  { return is(v, "string"); }
    function isNum(v)  { return is(v, "number"); }
    function isInt(v)  { return is(v, "number") && parseFloat(v) == parseInt(v, 10) && !isNaN(v); }
    function isArr(v)  { return Object.prototype.toString.call(v) === '[object Array]'; }
    function isObj(v)  { return Object.prototype.toString.call(v) === '[object Object]'; }

    function silence() {
      self._silence_error_logging = true;
    }
 
    function unsilence() {
      self._silence_error_logging = false;
    }

    function setUndefined() {
      return;
    }
 
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
    if (this._is_server_side) {
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

      if (self._is_server_side) {
        try {
          if (name[0] == '.') {
            abs_name = self.__dirname + '/' + name.slice(2);
          } else if (name[0] == '/') {
            abs_name = name;
          } else {
            abs_name = self.view_dir + '/' + name; 
          }

          if (!/\.manana$/.test(abs_name)) {
            abs_name += ".manana";
          }

          template = self.file_system.readFileSync(abs_name, 'utf-8');

        } catch (e) {
          self.err = new MananaError(strFmt("Invalid name '{p}' provided to getTemplate function", {p:name}));
          throw self.err;
        }
      } else { // self._is_client_side
        scripts = document.getElementsByTagName("script"); 
        for (i = 0, l = scripts.length; i < l; i++) {
          s = scripts[i];
          s_name = s.getAttribute("data-view-name");
          if (s_name == name) {
            template = s.innerHTML;
          }
        }
      }

      if (!template.length) {
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
     * @param {Object} [setup=null] - A single object containing  setup paramaters
     * @param {String} setup.view - The name of the view 
     * @param {*} [setup.context={}] - The context 
     * @param {Object} [setup.format={}] - The format options 
     * @param {string} [name=null] - The name of the template
     * @param {*} [context={}] - A non-falsy value to be passed into the template
     * @param {Object} [options={}] - Optional options for rendering
     */
    this.render = function() {
      var err_data, args, name, context, options, form, i, r, level;

      // Configure error data.
      err_data = {"arguments": arguments};

      // Render method can accept a single object as its only argument,
      // or (name [, context [, options]]) as positional arguments.
      if (isObj(arguments[0])) {
        if (arguments.length > 1) {
          self.err = new MananaError("Too many arguments in Render function", err_data);
          throw self.err;
        }
        args = arguments[0];
        name = args.view;
        context = args.context || {};
        options = args.options || {};
      }
      else if (isStr(arguments[0])) {
        name = arguments[0];
        context = arguments[1] || {};
        options = arguments[2] || {};
      }

      // Validate required config is present.
      self.name = name;
      self.template = self.getTemplate(self.name);
      self.ir = self.parser.parse(self.template);

      // Setup default namespace "root"
      self.namespace.root = new MananaNamespace('root', context, null);
      self.context = self.namespace.root;

      // Configure formatting options for output.
      if ('format' in options) {
        self._format_result = true;

        self.format = {};
        self.format.indent          = parseInt(options.format.indent) || 4;
        self.format.indent_char     = options.format.indent_char || " ";
        self.format.indent_str      = repeatStr(self.format.indent_char, self.format.indent);
        self.format.max_line_length = options.format.max_line_length || 72;
      }
      else {
        self._format_result = false;
      }

      // Setup View
      self.views[name] = new MananaView({
        name: name,
        template: self.template,
        context: self.context,
        $level: 0,
        $parent: null
      });

      self.view = self.views[name];
      self.ancestry = [self.view];

      // Setup window
      self['$window'];
      if (typeof window !== "undefined") {
        self['$window'] = window;
      }

      // Get result.
      self.result = '';

      i = level = 0;
      while (form = self.ir[i]) {
        r = self.interpreter.evalForm(form, self.context, level);
        self.result += isObj(r) ? JSON.stringify(r) : r;
        i++;
      }

      if (options.encode) {
        self.result = self.text.encode(self.result);
      }

      return self.result;
    }; // end Manana.render()

    // _____________________________________________ Interpreter
    
    // ...........................................  
    /**
     * Low-level method to evaluate a Mañana AST Node
     * @memberof Manana.interpreter
     * @method evalForm
     * @param {Object} form - A Mañana AST node 
     * @param {*} context - A value to be passed as the context for a view
     */
    this.interpreter.evalForm = function(form, context, level) {
      var res, i, _is_node, _is_special;

      if (isObj(form) && 'type' in form) {
        _is_node = true;

        switch (form.type) {
          case 'Path':
          case 'Function':
          case 'MananaBoolean':
            _is_special = true; 
            break;
          default:
            _is_special = false;
        }
      }
      else {
        _is_node = false;
      }

      if (_is_special) {
        res = self.interpreter[form.type](form, context, level);
      }
      else if (_is_node) {
        res = '' + self.interpreter[form.type](form, context, level);
      }
      else if (isArr(form)) {
        res = '';
        i = 0;
        while (!is(form[i], "undefined")) {
          res += self.interpreter.evalForm(form[i], context, level);
          i++;
        }
      } 
      else {
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
     * @param {Number} level - The current level used for output formatting
     */
    this.interpreter.Include = function(form, context, level) {
      var name, template, ir, $parent, i, form, res;

      name = self.interpreter.evalForm(form.path, context, level);
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
        res += self.interpreter.evalForm(form, context, level);
        i++;
      }

      self.view = $parent;
      self.view_level--;

      return res;
    }; // end Manana.interpreter.Include()

    // ...........................................  
    /**
     * Resolve a path for an expression, argument, or name
     * @memberof Manana.interpreter
     * @method Path
     * @param {Object} form - A Mañana.ast.PathNode 
     * @param {*} context - A value to be passed as the context for a view
     * @param {Number} level - The current level used for output formatting
     */
    this.interpreter.Path = function(form, context, level) {
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
      while (!is(components[i], "undefined")) {
        target = self.interpreter.evalForm(components[i][0], context, level);
        index  = self.interpreter.evalForm(components[i][1], context, level);
        slice  = self.interpreter.evalForm(components[i][2], context, level);

        index_str = (index === '*' ? '' : index);
        slice_str = (slice === '*' ? '' : slice);

        if (!is(index, 'undefined')) {
          if (!is(slice, 'undefined')) {
            traceback_str = target + '[' + index_str + ':' + slice_str + ']';
          } else {
            traceback_str = target + '[' + index_str + ']';
          }
        } else if (!is(slice, 'undefined')) {
          traceback_str = target + '[:' + slice_str + ']';
        } else {
          traceback_str = target;
        }

        traceback.push(traceback_str);

        //................ 
        if (self.validate.isNamespace(node)) {
          if (target[0] == '$' && !is(node[target], 'undefined')) {
            node = node[target];

          } else if (!isNull(node.data) && !is(node.data[target], 'undefined')) {
            node = node.data[target];

          } else if (node.name == target) {
            node = node.data;

          } else if (!is(self.namespace[target], 'undefined')) {
            node = self.namespace[target];

          } else if (node.$parent) {
            tmp_node = node;
            while (tmp_node.$parent) {
              tmp_node = tmp_node.$parent;
              if (!is(tmp_node.data[target], 'undefined')) {
                node = tmp_node.data[target];
                _node_set = true;
                break;
              }
            }

            if (!_node_set) {
              self.err = new MananaError('Could not find path in ancestry: "' + traceback.join('.') + '"', form.loc);
              throw self.err;
            }

          } else {
            self.err = new MananaError('Invalid path in namespace: "' + traceback.join('.') + '"', form.loc);
            throw self.err;
          }

        } else if (!is(node, 'undefined')) { 
          if (!is(node[target], "undefined")) {
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
        if (!is(slice, 'undefined')) {
          if (isStr(node)) {
            node = node.split('');
          } else if (!isArr(node)) {
            self.err = new MananaError('slicing attempted on non-list: ' + traceback.join('.'), form.loc);
            throw self.err;
          }

          index = index === '*' ? 0 : parseInt(index);
          slice = slice === '*' ? node.length : parseInt(slice);
          node = node.slice(index, slice);

        } else if (!is(index, 'undefined')) {
          if (isObj(node) && !is(node[index], 'undefined')) {
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

          if (!is(node[meth.name], 'function')) {
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
    }; // end Manana.interprteter.Path()

    // ...........................................  
    /**
     * Resolve a path for an expression, argument, or name
     * @memberof Manana.interpreter
     * @method Name
     * @param {Object} form - A Mañana.ast.NameNode 
     * @param {*} context - A value to be passed as the context for a view
     * @param {Number} level - The current level used for output formatting
     */
    this.interpreter.Name = function(form, context, level) {
      var res;

      if ('default_value' in form && !isNull(form.default_value)) {
        try {
          silence();
          res = self.interpreter.evalForm(form.path, context, level);
          unsilence();
        } catch (e) {
          unsilence();
          res = self.interpreter.evalForm(form.default_value, context, level);
        }
      } else {
        res = self.interpreter.evalForm(form.path, context, level);
      }

      return res;
    }; // end Manana.interpreter.Name()

    // ........................................... 
    /**
     * Create a temporary MananaNamespace to use for the duration of a block
     * @memberof Manana.interpreter
     * @method With
     * @param {Object} form - A Mañana.ast.WithNode 
     * @param {*} context - A value to be passed as the context for a view
     * @param {Number} level - The current level used for output formatting
     */
    this.interpreter.With = function(form, context, level) {
      var name, data, $parent, i, res;

      name = form.name !== null
        ? form.name
        : ('__with__' + Math.floor(Math.random() * (9999999 - 1000000) + 1000000));

      data = self.interpreter.evalForm(form.path, context, level);

      $parent = self.context;
      self.namespace[name] = new MananaNamespace(name, data, $parent);
      self.context = self.namespace[name];

      if (!isNull(form.body)) {
        i = 0; 
        res = '';
        while (!is(form.body[i], "undefined")) {
          res += self.interpreter.evalForm(form.body[i], self.context, level);
          i++;
        }
      }

      delete self.namespace[name];

      self.context = $parent;

      return res;
    }; // end Manana.interpreter.With()

    // ...........................................  
    /**
     * Create a MananaNamespace that persists
     * @memberof Manana.interpreter
     * @method Alias
     * @param {Object} form - A Mañana.ast.AliasNode 
     * @param {*} context - A value to be passed as the context for a view
     * @param {Number} level - The current level used for output formatting
     */
    this.interpreter.Alias = function(form, context, level) {
      var name, data;

      if (!self.validate.isNamespace(context)) {
        self.err = new MananaError("Invalid context passed to Alias method. Must be a valid namespace.", form.loc);
        throw self.err;
      }

      if (!is(context[name], "undefined")) {
        self.err = new MananaError(strFmt("Can't alias '{id}'. Name already taken in current context.", form.loc));
        throw self.err;
      }

      name = form.id;
      data = self.interpreter.evalForm(form.path, context, level);

      self.namespace[name] = data;

      return '';
    }; // end Manana.interpreter.Alias()

    // ...........................................  
    /**
     * Remove a MananaNamespace created by Alias
     * @memberof Manana.interpreter
     * @method Unalias
     * @param {Object} form - A Mañana.ast.UnaliasNode 
     * @param {*} context - A value to be passed as the context for a view
     * @param {Number} level - The current level used for output formatting
     */
    this.interpreter.Unalias = function(form, context, level) {
      var id;

      id = self.interpreter.evalForm(form.id, context, level);

      if (is(self.namespace[id], 'undefined')) {
        self.err = new MananaError(strFmt('Unknown alias "{id}". Can not unalias.', form.loc));
        throw self.err;
      }

      delete self.namespace[id];

      return '';
    }; // end Manana.interpreter.Unalias()

    // ...........................................  
    /**
     * Conditional operator used to evaluate true or false
     * @memberof Manana.interpreter
     * @method If
     * @param {Object} form - A Mañana.ast.IfNode 
     * @param {*} context - A value to be passed as the context for a view
     * @param {Number} level - The current level used for output formatting
     */
    this.interpreter.If = function(form, context, level) {
      var body,         // form.body
          num_branches, // number of branches (if, elif, else)
          branch,       // an inidivual branch
          last_branch,  // the last branch in the node tree - used to check for else
          branch_stop,  // index for when the top level while-loop should stop
          num_exprs,    // number of expressions to eval
          exprs,        // local reference to the expressions list 
          expr,         // an individual expression
          next_expr,    // the next expression in the list
          i,            // current index for branches
          j,            // current index for expressions
          op,           // operator for expression
          rel,          // relation for expression (null, and, or)
          v1,           // 1st value in expression
          v2,           // 2nd value in expression (optional)
          res,          // boolean result of expression evaluation
          out_body,     // forms to evaluate for output
          out,          // output string
          prev,         // boolean result of previous expression evaluation
          ctx,          // shorthand for ctx
          el,           // reference to each body element to evaluate
          _eval,        // local reference to self.interpreter.evalForm
          _has_else,    // flag: does an else-clause exist?
          _negate;      // flag: are we negating the boolean result?

      _eval        = self.interpreter.evalForm;
      ctx          = context;
      body         = form.body;
      num_branches = body.length;
      last_branch  = body[num_branches-1];
      _has_else    = last_branch.branch === 'else';
      branch_stop  = _has_else ? (num_branches - 1) : num_branches;

      i = 0;
      while (i < branch_stop) {
        res       = setUndefined();
        branch    = body[i];
        op        = branch.op;
        exprs     = branch.expressions;
        expr_stop = exprs.length;

        j = 0;
        while (j < expr_stop) {
          prev      = res;
          res       = setUndefined();
          expr      = exprs[j];
          next_expr = exprs[j+1] || false;
          op        = expr.operator;
          rel       = expr.relation;
          v1        = expr.value1;
          v2        = expr.value2;
          _negate   = expr.negate;

          switch (op) {
            //. .. ... ..  . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
            case 'exists':
              silence();
              try {
                _eval(v1, ctx);
                res = true;
              } 
              catch (e) {
                res = false;
              } 
              finally {
                unsilence();
              }
              break;
           
            //. .. ... ..  . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
            case 'in':
              v1 = _eval(v1, ctx);
              v2 = _eval(v2, ctx);
              if (isArr(v2) || isStr(v2))
                res = v2.indexOf(v1) > -1;
              else if (isObj(v2))
                res = (v1 in v2);
              break;
           
            //. .. ... ..  . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
            case 'is':
              v1 = _eval(v1, ctx);
              v2 = _eval(v2, ctx);
              switch (v2) {
                case 'Hash'   : res = isObj(v1) ; break;
                case 'List'   : res = isArr(v1) ; break;
                case 'String' : res = isStr(v1) ; break;
                case 'Number' : res = isNum(v1) ; break;
                case 'Integer': res = isInt(v1) ; break;
                case 'Boolean': res = isBool(v1); break;
                default       : res = false;
              }
              break
           
            //. .. ... ..  . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
            case '==': res = _eval(v1, ctx) == _eval(v2, ctx); break;
            case '!=': res = _eval(v1, ctx) != _eval(v2, ctx); break;
            case '>' : res = _eval(v1, ctx) >  _eval(v2, ctx); break;
            case '<' : res = _eval(v1, ctx) <  _eval(v2, ctx); break;
            case '>=': res = _eval(v1, ctx) >= _eval(v2, ctx); break;
            case '<=': res = _eval(v1, ctx) <= _eval(v2, ctx); break;
            case '%' : res = _eval(v1, ctx) %  _eval(v2, ctx); break;
           
            //. .. ... ..  . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
            case true: // Loose checking for truthy|falsey
              v1 = _eval(v1, ctx);
              res = !!v1;
              break;
          } // end switch(op)

          // Negate result if flag set true.
          res = _negate ? !res : res;

          // Check next expression's relation.
          // If OR and result is true, break.
          if (next_expr) {
            if (next_expr.relation === 'and' && !res) {
              break;
            }
            if (next_expr.relation === 'or' && res) {
              break;
            }
          }

          // Check current expression's relation.
          // If not null, combine with previous result.
          if (rel !== null) {
            switch (rel) {
              case 'and': res = (res && prev); break;
              case 'or' : res = (res || prev); break;
            }
          }

          j++;
        } // end while(j < expr_stop)

        // If result has been set stop evaluation
        if (res) {
          break;
        }

        i++;
      } // end while(i < branch_stop)

      if (res)
        out_body = branch.body;
      else if (_has_else)
        out_body = last_branch.body;

      out = '';
      if (out_body && out_body.length > 0) {
        for (i = 0, l = out_body.length; i < l; i++) {
          el = out_body[i];
          out += _eval(el, ctx);
        }
      }

      return out;
    }; // end Manana.interpreter.If()

    // ...........................................  
    /**
     * Mañana switch-statement
     * @memberof Manana.interpreter
     * @method Switch
     * @param {Object} form - A Mañana.ast.SwitchNode 
     * @param {*} context - A value to be passed as the context for a view
     * @param {Number} level - The current level used for output formatting
     */
    this.interpreter.Switch = function(form, context, level) {
      var control, i, c, j, len, value, res;

      control = self.interpreter.evalForm(form.control, context, level);

      res = '';

      i = 0; 
      while (c = form.cases[i]) {
        ++i;

        value = self.interpreter.evalForm(c.value, context, level);

        if (value == control) {
          len = c.block.length;
          for (j = 0; j < len; j++) {
            res += self.interpreter.evalForm(c.block[j], context, level);
          }
        }
      }

      if (!res.length && form.else_case) {
        i = 0;
        while (c = form.else_case[i]) { 
          ++i;
          res += self.interpreter.evalForm(c, context, level);
        }
      }

      return res;
    }; // end Manana.interpreter.Switch()

    // ...........................................  
    /**
     * Mañana loop-construct
     * @memberof Manana.interpreter
     * @method For
     * @param {Object} form - A Mañana.ast.ForNode 
     * @param {*} context - A value to be passed as the context for a view
     * @param {Number} level - The current level used for output formatting
     */
    this.interpreter.For = function(form, context, level) {
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

        if (!isNull(form.body)) {
          i = 0;
          while (!is(form.body[i], "undefined")) {
            if (self._break_loop) {
              cleanUpLoop();
              break;
            }
         
            if (self._continue_loop)
              continue;
         
            res += self.interpreter.evalForm(form.body[i], local_scope, level); 
         
            i++;
          }
        }
      }

      function cleanUpLoop() {
        delete self.namespace[loop_name];
        delete self.namespace[name];
        self._in_loop = false;
        self._break_loop = false;
        self._continue_loop = false;
      }

      $parent = self.context;

      scope = self.interpreter.evalForm(form.path, context, level);
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

      if (!self.validate.isNamespace(scope))
        scope = new MananaNamespace(loop_name, scope, $parent);
      scope = self.namespace[loop_name] = scope;

      total = _is_obj ? objectSize(scope.data) : scope.data.length;
      count = 0;
      self._in_loop = true;

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
    }; // end Manana.interpreter.For()

    // ...........................................  
    /**
     * Break a loop
     * @memberof Manana.interpreter
     * @method Break
     * @param {Object} form - A Mañana.ast.BreakNode 
     * @param {*} context - A value to be passed as the context for a view
     * @param {Number} level - The current level used for output formatting
     */
    this.interpreter.Break = function(form, context, level) {
      if (!self._in_loop) {
        self.err = new MananaError('Break statement can only exist inside loop!', form.loc);
        throw self.err;
      }
      self._break_loop = true;
      return '';
    }; // end Manana.interpreter.Break()

    // ...........................................  
    /**
     * Continue a loop
     * @memberof Manana.interpreter
     * @method Continue
     * @param {Object} form - A Mañana.ast.ContinueNode 
     * @param {*} context - A value to be passed as the context for a view
     * @param {Number} level - The current level used for output formatting
     */
    this.interpreter.Continue = function(form, context, level) {
      if (!self._in_loop) {
        self.err = new MananaError('Continue statement can only exist inside loop!', form.loc);
        throw self.err;
      }
      self._continue_loop = true;
      return '';
    }; // end Manana.interpreter.Continue()
    
    // ...........................................  
    /**
     * A Mañana string, possibly containing interpolated paths
     * @memberof Manana.interpreter
     * @method MananaString
     * @param {Object} form - A Mañana.ast.MananaStringNode 
     * @param {*} context - A value to be passed as the context for a view
     * @param {Number} level - The current level used for output formatting
     */
    this.interpreter.MananaString = function(form, context, level) {
      var i = 0, res = '';

      if (!isNull(form.body)) {
        while (!is(form.body[i], "undefined")) {
          res += self.interpreter.evalForm(form.body[i], context, level);
          i++;
        }
      }

      return res;
    } // end Manana.interpreter.MananaString()

    // ...........................................  
    /**
     * A Mañana boolean value. 
     * @memberof Manana.interpreter
     * @method MananaBoolean
     * @param {Object} form - A Mañana.ast.MananaBooleanNode 
     * @param {Number} level - The current level used for output formatting
     */
    this.interpreter.MananaBoolean = function(form, context, level) {
      return form.value;
    }; // end Manana.interpreter.MananaBoolean()

    // ...........................................  
    /**
     * An HTML tag
     * @memberof Manana.interpreter
     * @method Tag
     * @param {Object} form - A Mañana.ast.TagNode 
     * @param {*} context - A value to be passed as the context for a view
     * @param {Number} level - The current level used for output formatting
     */
    this.interpreter.Tag = function(form, context, level) {
      var html, attr_tpl, content, i, kv, next_level, res, node, _indent_next;

      // Create content{} to interpolate in final micro-template later.
      content = {tag: form.tag, attrs: '', body: '', indent: ''};
 
      // Resolve attributes.
      attr_tpl = ' {key}="{val}"'; 
      if (isArr(form.attrs)) {
        i = 0;
        while (form.attrs[i]) {
          kv = {};
          if (form.attrs[i][0] == "src" && form.tag == "a") {
            kv.key = "href";
          } 
          else {
            kv.key = self.interpreter.evalForm(form.attrs[i][0], context, level);
          } 
          kv.val = self.interpreter.evalForm(form.attrs[i][1], context, level); 
          content.attrs += strFmt(attr_tpl, kv); 
          i++; 
        }
      }

      // Evaluate nested AST nodes.
      if (isNull(form.body)) {
        _indent_next = false;
      }
      else {
        next_level = level + 1;

        node = form.body;
        _indent_next = (self._format_result && 
                       isArr(node) && 
                       node.length > 0 && 
                       /^Tag|VoidTag|CodeTag$/.test(node[0].type));

        i = 0;
        while (!is(form.body[i], "undefined")) {
          node = form.body[i];
          content.body += self.interpreter.evalForm(node, context, next_level);
          i++;
        }
      }

      // Render final micro-template
      if (_indent_next) {
        html = '{indent}<{tag}{attrs}>\n{body}\n{indent}</{tag}>\n';
        content.indent = repeatStr(self.format.indent_str, level);
      }
      else if (self._format_result) {
        html = '{indent}<{tag}{attrs}>{body}</{tag}>\n';
        content.indent = repeatStr(self.format.indent_str, level);
      }
      else {
        html = '<{tag}{attrs}>{body}</{tag}>';
      }

      res = strFmt(html, content);

      return res;
    }; // end Manana.interpreter.Tag()

    // ...........................................  
    /**
     * An HTML pre or code tag
     * @memberof Manana.interpreter
     * @method CodeTag
     * @param {Object} form - A Mañana.ast.CodeTagNode 
     * @param {*} context - A value to be passed as the context for a view
     * @param {Number} level - The current level used for output formatting
     */
    this.interpreter.CodeTag = function(form, context, level) {
      var html, attr_tpl, content, i, kv;

      html = '<{tag}{attrs}>{body}</{tag}>'; 
      attr_tpl = ' {key}="{val}"'; 
      content = {tag: form.tag, attrs: '', body: ''};

      if (isArr(form.attrs)) {
        i = 0;
        while (form.attrs[i]) {
          kv = {};
          if (form.attrs[i][0] == "src" && form.tag == "a") {
            kv.key = "href";
          } else {
            kv.key = self.interpreter.evalForm(form.attrs[i][0], context, level);
          } 
          kv.val = self.interpreter.evalForm(form.attrs[i][1], context, level); 
          content.attrs += strFmt(attr_tpl, kv); 
          i++; 
        }
      }

      content.body = "\n" + form.body.join("\n");

      return strFmt(html, content);
    }; // end Manana.interpreter.CodeTag()

    // ...........................................  
    /**
     * An HTML void tag
     * @memberof Manana.interpreter
     * @method VoidTag
     * @param {Object} form - A Mañana.ast.VoidTagNode 
     * @param {*} context - A value to be passed as the context for a view
     * @param {Number} level - The current level used for output formatting
     */
    this.interpreter.VoidTag = function(form, context, level) {
      var html, attr_tpl, content, i;

      html = '<{tag}{attrs}>';
      attr_tpl = ' {key}="{val}"';
      content = {tag: form.tag, attrs: ''};

      if (isArr(form.attrs)) {
        level++;

        i = 0;
        while (form.attrs[i]) {
          content.attrs += strFmt(attr_tpl, { 
                             key: self.interpreter.evalForm(form.attrs[i][0], context, level), 
                             val: self.interpreter.evalForm(form.attrs[i][1], context, level)
                           });
          i++; 
        }
      }

      return strFmt(html, content);
    }; // end Manana.interpreter.VoidTag()

    // ...........................................  
    /**
     * Text, possibly containing interpolated paths
     * @memberof Manana.interpreter
     * @method Text
     * @param {Object} form - A Mañana.ast.TextNode 
     * @param {*} context - A value to be passed as the context for a view
     * @param {Number} level - The current level used for output formatting
     */
    this.interpreter.Text = function(form, context, level) {
      var i, res;

      if (!isNull(form.body)) {
        i = 0; 
        res = [];
        while (!is(form.body[i], "undefined")) {
          res.push(self.interpreter.evalForm(form.body[i], context, level));
          i++;
        }
      }

      return res.join(' ');
    }; // end Manana.interpreter.Text()

    // ...........................................  
    /**
     * Switches parser into "filter mode", allowing block text (by default) or another language injected
     * @memberof Manana.interpreter
     * @method Filter
     * @param {Object} form - A Mañana.ast.FilterNode 
     * @param {*} context - A value to be passed as the context for a view
     * @param {Number} level - The current level used for output formatting
     */
    this.interpreter.Filter = function(form, context, level) {
      var i, res;

      if (!isNull(form.body)) {
        i = 0; 
        res = [];
        while (!is(form.body[i], "undefined")) {
          res.push(self.interpreter.evalForm(form.body[i], context, level));
          i++;
        }
      }

      return res.join(' ');
    }; // end Manana.interpreter.Filter()

    // _____________________________________________ Validation
    /**
     * Declare if a node is of type MananaNamespace
     * @memberof Manana.validate
     * @method isNamespace
     * @param {*} node - A value to check
     */
    // ...........................................  
    this.validate.isNamespace = function(node) {
      var is_ns = false;

      is_ns = node instanceof MananaNamespace;

      if (!is_ns) {
        if (node
            && node.type 
            && node.type == 'MananaNamespace'
            && node.name
            && !is(node.$parent, 'undefined')
            && !is(node.data, 'undefined'))
        {
          is_ns = true;
        }
      }

      return is_ns;
    }; // end Manana.validate.isNamespace()

    // _____________________________________________ Text Manipulation

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

      if (!/^\#ñ\(role="template"\)(?=\#ñ\{)/.test(brew)) {
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

      if (!indent_char) {
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
     * @param {Number} level - The current level used for output formatting
     */
    this.interpreter.Function = function(form, context, level) {
      var name, fn, i, args, res, _in_fns, _in_raw_fns;

      name = form.name;

      _in_fns = name in self.fns;
      _in_raw_fns = !_in_fns && name in self.raw_fns;

      if (!_in_fns && !_in_raw_fns) {
        self.err = new MananaError(strFmt('Function "{name}" is not defined.', form.loc));
        throw self.err;
      }

      fn = self.fns[name] || self.raw_fns[name];

      if (!is(fn, "function")) {
        self.err = new MananaError(strFmt('"{name}" is not a function', form.loc));
        throw self.err;
      }

      if (_in_raw_fns) {
        args = form.args;
      } else {
        args = [];
        if (form.args) {
          i = 0;
          while (!is(form.args[i], "undefined")) {
            args.push(self.interpreter.evalForm(form.args[i], context, level));
            i++;
          }
        }
      }

      try {
        res = fn.apply(self, args);
      } catch (e) {
        self.err = new MananaError(e.message, form.loc);
        throw self.err;
      }

      return res;
    }; // end Manana.interpreter.Function()

    // ...........................................  
    this.addFunction = function(name, fn) {
      if (!isStr(name)) {
        self.err = new MananaError("1st arg to Manana.add_fn() must be a string");
        throw self.err
      }

      if (name in self.raw_fns) {
        self.err = new MananaError('Function "' + name + '" already exists!');
        throw self.err
      }

      if (!is(fn, "function")) {
        self.err = new MananaError("2nd arg to Manana.add_fn() must be a function");
        throw self.err
      }

      self.fns[name] = fn;
    }; // end Manana.addFunction()

    // ...........................................  
    this.addRawFunction = function(name, fn) {
      if (!isStr(name)) {
        self.err = new MananaError("1st arg to Manana.add_raw_fn() must be a string");
        throw self.err
      }

      if (name in self.fns) {
        self.err = new MananaError('Function "' + name + '" already exists!');
        throw self.err
      }

      if (!is(fn, "function")) {
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
      while (!is(arguments[i], "undefined")) {
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

    // _____________________________________________ Built-in raw functions
    
    // ........................................... 
    /**
     * Determine the first argument that does not throw an error
     * @memberof Manana.fns
     * @method first_valid
     * @param {*} arguments... - n-number of arguments to evaluate
     */
    self.raw_fns.first_valid = function() {
      var i, arg, res; 

      silence();

      i = 0;
      while (arg = arguments[i]) {
        ++i;
        try {
          res = self.interpreter.evalForm(arg, self.context);
          break;
        } 
        catch (e) {
          continue;
        } 
        finally {
          unsilence();
        }
      }

      if (!is(res, 'undefined'))
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
