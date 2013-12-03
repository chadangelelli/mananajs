
(function() {

  // ****************************************************
  // Error Handling
  // ****************************************************
  function MananaException(message, fn) {
    this.name = 'MananaException';
    this.message = message || "Could not process Manana code.";
    this.fn = String(fn) || "No function provided.";
  };
  MananaException.prototype = new Error();
  MananaException.prototype.constructor = MananaException;
  MananaException.prototype.toString = function() {
    return this.name + ': "' + this.message + '"';
  };

  // ****************************************************
  // Shorthand
  // ****************************************************
  function isObj(o)   { return '[object Object]' === Object.prototype.toString.call(o); }
  function isArr(r)   { return '[object Array]' === Object.prototype.toString.call(r); }
  function isStr(s)   { return typeof s === 'string'; }
  function isInt(i)   { return typeof n === 'number' && n % 1 == 0; }
  function isUndef(v) { return typeof v === "undefined"; }
  function defined(v) { return ! isUndef(v); }
  function isNull(v)  { return null === v; }

  // ****************************************************
  // Core Functions
  // ****************************************************
  function ARGS(args) {
    return args;
  }

  function ATTRS(args) {
    return args;
  } 

  function ID(args) {   
    return args;
  } 

  function TEXT(args) { 
    console.log(' ');
    console.log('TEXT:', args);
    console.log(' ');
    var i = 0, string = '';
    while (args[i]) { string += args[i]; i++; }
    return string;
  } 

  function FN(args) {   
    return args;
  } 

  function TAG(args) {  
    return args;
  } 

  function PATH(args) { 
    return args;
  } 

  function raise(error, fn) {
    throw new MananaException(error.message, fn); 
  }

  // ****************************************************
  // Interpreter
  // ****************************************************
  function Manana(source, context) {
    var self       = this; 
    this.source    = source;
    this.ir        = manana_parser.parse(source);
    this.context   = context || {};
    this.result    = null;
    this.traceback = [];
    this.ARGS      = ARGS;
    this.ATTRS     = ATTRS;
    this.ID        = ID;
    this.TEXT      = TEXT;
    this.FN        = FN;
    this.TAG       = TAG;
    this.PATH      = PATH; 

    this.evalForm = function(form, context) {
      var i = 0, fn, args;

      if (isArr(form) && form.length) {
        fn = form.shift();
        args = form; 

        /*
        if (self.traceback.length > 10) { self.traceback.shift(); }
        self.traceback.push({ 'fn':fn, 'args':args });

        try {
          while(args[i]) {
            self.xy[0] = i;
            args[i] = self.evalForm(args[i]); 
            i++; 
          }
        } catch (e) {
          console.log(' ');
          console.log(e);
          console.log(' ');
          console.log('TRACEBACK: ', self.traceback);
          console.log(' ');
          raise(e, fn);  
          console.log(' ');
        }

        console.log("\tCalling: " + typeof fn + " " + fn);
        return self[fn](args); 

      } else {
        return form;
      }
    }; // end Manana.evalForm()

    this.eval = function() {
      var i = 0;
      while (this.ir[i]) { 
        self.result = self.evalForm(self.ir[i]); 
        i++; 
      }
      return self.result;
    }; // end Manana.eval()

  }; // end Manana()

  // ****************************************************
  // node.js
  // **************************************************** 
  if (defined(require) && defined(exports)) {
    exports.main = function commonjsMain(args) {
      if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
      }
      var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
      return new Manana(source).eval();
    };
  } else {
    window.Manana = Manana;
  }

  if (typeof module !== 'undefined' && require.main === module) {
    exports.main(process.argv.slice(1));
  }

}() );
