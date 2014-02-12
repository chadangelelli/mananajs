(function(exports) {
 
  // _____________________________________________ Error-handling
  function MananaError(message, loc) {
    this.name = "MananaError";
    this.message = message;
    this.loc = loc;
  } // end MananaError()

  // _____________________________________________ Validation shorthand 
  function isStr(v)  { return typeof v === "string"; }
  function isInt(v)  { return typeof v === "number" && parseFloat(v) == parseInt(v, 10) && ! isNaN(v); }
  function isArr(v)  { return Object.prototype.toString.call(v) === '[object Array]'; }
  function isObj(v)  { return Object.prototype.toString.call(v) === '[object Object]'; }
  function isNull(v) { return v === null; }

  // _____________________________________________ Interpreter
  function MananaInterpreter() {
    if (typeof require !== "undefined") {
      this.Parser = require('./manana_parser');
      this.parser = this.Parser.parser;
      this.parse  = this.Parser.parse;
    } else {
      this.parser = manana_parser;
      this.Parser = manana_parser.Parser;
      this.parse  = manana_parser.parse;
    }

    this.code = '';
    this.context = {};
    this.ir = '';
    this.result = '';

    this.evalForm = function(form, context) {
      var res = '', i;
      if (isObj(form)) {
        res += this[form.type](context);
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

    this.eval = function(code, context) {
      var i = 0, form;

      this.code = code;
      this.context = context || {};
      this.ir = this.parse(code);

      while (form = this.ir[i]) {
        this.result += this.evalForm(form, this.context);
        i++;
      }

      console.log(JSON.stringify(this.ir, null, 4));
      console.log("\n\n");
      return this.result;
    }; // end MananaInterpreter.eval()

    this.Path = function(form, context) {
    }; // end MananaInterprteter.Path()

    this.With = function(form, context) {
      // path, id, body, loc
              

      return form;
    }; // end MananaInterpreter.With()

  } // end MananaInterpreter()

  // _____________________________________________ Make available in both node.js & browser 
  if (typeof window !== "undefined") {
    window.MananaInterpreter = MananaInterpreter;
  } else {
    exports.MananaInterpreter = MananaInterpreter;
  }

})(typeof exports === "undefined" ? this['manana'] = {} : exports);
