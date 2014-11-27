
(function(exports) {
  // _____________________________________________________________
  var _isServerSide = typeof require        !== 'undefined'
                   && typeof module         !== 'undefined'
                   && typeof module.exports !== 'undefined' ;

  // _____________________________________________________________
  function MananaTranslator(args) {
    var self = this, _p;

    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    this._isServerSide = _isServerSide;

    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    this.lang = args.lang || 'html';
    this.code = args.code || '';
    this.file = args.file || null;
    this.ir = null;
    this.res = null;

    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    if (this._isServerSide) {
      _p = require('./parsers/' + this.lang + '/' + this.lang + '_parser');
      this.Parser = _p.Parser;
      this.parser = _p.parser;
    } else {
      this.parser = window[this.lang + '_parser'];
      this.Parser = this.parser.Parser;
    }

    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    this.evalForm = function(form) {
      var res = '', i;

      console.log(form);

    }; // end MananaTranslator.evalForm()

    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    this.translate = function() {
      var i;

      self.ir = self.parser.parse(self.code);
      self.res = '';

      i = 0;
      while (form = self.ir[i]) {
        self.res += self.evalForm(form);
        ++i;
      }

      return self.res;
    }; // end MananaTranslator.translate()

  }; // end MananaTranslator()

  if (_isServerSide) {
    exports['MananaTranslator'] = MananaTranslator;
  } else {
    window['MananaTranslator'] = MananaTranslator;
  }

})(typeof exports === "undefined" ? {} : exports);
