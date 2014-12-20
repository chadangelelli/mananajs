(function(exports) {

  // _____________________________________________________________
  String.prototype.repeat = function(times) { 
    return new Array(parseInt(times)+1).join(this); 
  };
  
  String.prototype.intpol = function(o) {
    return this.replace(/{([^{}]*)}/g,
      function (a, b) {
        var r = o[b];
        return typeof r === 'string' || typeof r === 'number' ? r : a;
      }
    );
  };

  Object.isObject = function(obj) { 
    return '[object Object]' === Object.prototype.toString.call(obj); 
  }

  Object.isArray = function(obj) { 
    return '[object Array]' === Object.prototype.toString.call(obj); 
  }

  // _____________________________________________________________
  var _isServerSide =    typeof require        !== 'undefined'
                      && typeof module         !== 'undefined'
                      && typeof module.exports !== 'undefined' ;

  // _____________________________________________________________
  function MananaTranslator(args) {
    var self = this, _p, _d;

    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    this._isServerSide = _isServerSide;
    this.lang          = args.lang || 'html';
    this.code          = args.code || '';
    this.file          = args.file || null;
    this.indentStr     = args.indentStr || '    ';
    this.indentLevel   = parseInt(args.initialIndentLevel || 1);
    this.expandAttrs   = args.expandAttrs || false;
    this.ir            = null;
    this.openTags      = [];
    this.nextToken     = null;
    this.lines         = [];
    this.res           = null;

    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    if (this._isServerSide) {
      _p = require('./parsers/' + this.lang + '/' + this.lang + '_parser');
      this.Parser = _p.Parser;
      this.parser = _p.parser;

      _d = __dirname.split('/');
      _d.pop();
      _d.pop();
      _d = _d.join('/');

      this.mananaParser = require(_d + '/lib/manana_parser.js');
      this.mananaAst = this.mananaParser.parser.ast;
      this.Manana = require(_d + '/bin/manana.js').Manana;
      this.manana = new this.Manana();

    } else {
      this.parser = window[this.lang + '_parser'];
      this.Parser = this.parser.Parser;

      this.mananaParser = manana_parser;
      this.mananaAst = this.mananaParser.parser.ast;
      this.Manana = Manana;
      this.manana = new Manana();
    }

    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    this.createTagString = function(form) {
      var tpl, strings, res, a1, a2, cls, i, a, n;

      function buildClassStr(clsStr) {
        var cls, res;
        
        cls = clsStr.split(' ');
        res = ''; 

        for (i in cls) {
          res += '.' + cls[i];
        }

        return res
      }

      tpl = '{indent}{tag}{attrs}';

      strings = { 
        indent: self.indentStr.repeat(self.indentLevel),
        tag: form.tag, 
        attrs: '' 
      };

      if (form.attrs !== null && form.attrs.length) {
        if (form.attrs.length === 2) {
          a1 = form.attrs[0].name.toLowerCase();
          a2 = form.attrs[1].name.toLowerCase();

          if (a1 == 'id' && a2 == 'class') {
            strings.attrs += ' #{value} '.intpol(form.attrs[0]);
            strings.attrs += buildClassStr(form.attrs[1].value);

          } else if (a1 == 'class' && a2 == 'id') {
            strings.attrs += ' #{value} '.intpol(form.attrs[1]);
            strings.attrs += buildClassStr(form.attrs[0].value);

          } else {
            for (i in form.attrs) {
              a = form.attrs[i];
              if (a.type === 'DataAttr') {
                strings.attrs += ' *' + a.name.slice(5) + '="' + a.value + '"';
              } else {
                strings.attrs += ' {name}="{value}"'.intpol(a);
              }
            }
            strings.attrs = ' (' + strings.attrs.slice(1) + ') ';
          }
        } else if (form.attrs.length === 1) {
          a = form.attrs[0];
          n = a.name.toLowerCase();
          if (n == 'id') {
            strings.attrs += ' #{value}'.intpol(a)
          } else if (n == 'class') {
            strings.attrs += buildClassStr(a.value);
          } else if (a.type === 'DataAttr') {
            strings.attrs += ' (*' + a.name.slice(5) + '="' + a.value + '")';
          } else {
            strings.attrs += ' ({name}="{value}")'.intpol(a);
          }
        } else {
          for (i in form.attrs) {
            strings.attrs += ' {name}="{value}"'.intpol(form.attrs[i]);
          }
          strings.attrs = ' (' + strings.attrs.slice(1) + ') ';
        }
      }

      res = tpl.intpol(strings);

      return res;
    }; // end MananaTranslator.createTagString()
    
    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    this.createTextString = function(form) {
      var line, lastLine, res;

      function buildText(text) {
        return self.indentStr.repeat(self.indentLevel + 1)
               + ':text\n'
               + self.indentStr.repeat(self.indentLevel + 2)
               + text;
      }

      if (form.text.length < 78) {
        lastLine = self.lines[self.lines.length-1];
        line = lastLine + ' ' + form.text;

        if (line.length < 80) {
          self.lines[self.lines.length-1] = line;
          return '';
        } else {
          return buildText(form.text);
        }
      } else {
        return buildText(form.text);
      }

    }; // end MananaTranslator.createTextString()

    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    this.createCommentString = function(form) {
      var tpl, strings, res;

      tpl = '{indent}""" {comment}\n{indent}"""';
      strings = {
        indent: self.indentStr.repeat(self.indentLevel),
        comment: form.body.replace(/(<!\-\-\s*)|(\-\->)/g, '')
      };

      res = tpl.intpol(strings);

      return res;
    };

    
    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    this.evalForm = function(form) {
      var res = '', i;

      switch (form.type) {
      //---------------------------------------------
      case 'Tag':
        self.openTags.push(form.tag);

        res = self.createTagString(form); 

        if (self.nextToken.type == 'Tag') {
          self.indentLevel++;
        }
        break;
      //---------------------------------------------
      case 'CloseTag':
        break;
      //---------------------------------------------
      case 'Text':
        res = self.createTextString(form);
        break;
      //---------------------------------------------
      case 'Comment':
        res = self.createCommentString(form);
        break;
      default:
        throw new Error('Unknown Form in MananaTranslator: ' + JSON.stringify(form));
      }

      return res;
    }; // end MananaTranslator.evalForm()

    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    this.translate = function() {
      var i;

      self.ir = self.parser.parse(self.code);
      self.res = '';

      i = 0;
      while (form = self.ir[i]) {
        ++i;
        self.nextToken = self.ir[i] || null;
        self.lines.push(self.evalForm(form));
      }

      //console.log(JSON.stringify(self.ir, null, 4));

      self.lines = self.lines.filter(function(n) { return n !== ''; });

      self.res = self.lines.join('\n');

      return self.res;
    }; // end MananaTranslator.translate()

  }; // end MananaTranslator()



  if (_isServerSide) {
    exports['MananaTranslator'] = MananaTranslator;
  } else {
    window['MananaTranslator'] = MananaTranslator;
  }

})(typeof exports === "undefined" ? {} : exports);
