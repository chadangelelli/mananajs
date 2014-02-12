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

    this.evalForm = function(form, context) {
    } // end MananaInterpreter.evalForm()

    this.eval = function(code, context) {
      this.code = code;
      this.context = context || {};
      this.result = this.parse(code);
      return this.result;
    } // end MananaInterpreter.eval()

  } // end MananaInterpreter()

  // _____________________________________________ Make available in both node.js & browser 
  if (typeof window !== "undefined") {
    window.MananaInterpreter = MananaInterpreter;
  } else {
    exports.MananaInterpreter = MananaInterpreter;
  }

})(typeof exports === "undefined" ? this['manana'] = {} : exports);
