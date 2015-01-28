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
  };

  Object.isArray = function(obj) { 
    return '[object Array]' === Object.prototype.toString.call(obj); 
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

  // _____________________________________________________________
  var _isServerSide =    typeof require        !== 'undefined'
                      && typeof module         !== 'undefined'
                      && typeof module.exports !== 'undefined' ;

  // _____________________________________________________________
  function MananaTranslator(args) {
    var self = this, _p, _d;

    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    this._isServerSide       = _isServerSide;
    this.lang                = args.lang || 'html';
    this.code                = args.code || '';
    this.file                = args.file || null;
    this.indentStr           = args.indentStr || '    ';
    this.indentLevel         = parseInt(args.initialIndentLevel || 1);
    this.singleLineTextLimit = args.singleLineTextLimit || 50;
    this.expandAttrs         = args.expandAttrs || false;
    this.ir                  = null;
    this.openTags            = [];
    this.nextToken           = null;
    this.lines               = [];
    this.res                 = null;

    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    if (this._isServerSide) {
      this.htmlparser = require("../../node_modules/htmlparser");
      this.handler = new this.htmlparser.DefaultHandler(function (error, dom) {
          if (error)
            console.log('Error: ', error);
      });
      this.parser = new this.htmlparser.Parser(this.handler);

      /*
      _d = __dirname.split('/');
      _d.pop();
      _d.pop();
      _d = _d.join('/');
      */

    } else {
      throw '\n\nhtmlparser not plugged in\n\n';
    }

    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    this.createAttrString = function(attrs) {
      var a, size, str;

      size = Object.size(attrs);
      if (size === 1 && 'id' in attrs) {
        str = '#' + attrs.id;

      } else if (size === 1 && 'class' in attrs) {
        str = '.' + attrs.class.split(' ').join('.');

      } else if (size === 2 && 'id' in attrs && 'class' in attrs) {
        str = '#' + attrs.id + '.' + attrs.class.split(' ').join('.');

      } else {
        str = ' (';
        for (a in attrs) {
          str += (/^data-/.test(a) ? a.replace('data-', '*') : a) + '="' + attrs[a] + '" ';
        }
        str = str.replace(/\s\s*$/, '');
        str += ')';
      }

      return str;
    };

    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    this.createTextString = function(raw, indentLevel) {
      var indent, str;

      indent = self.indentStr.repeat(indentLevel);

      str = indent + ':text\n' + self.indentStr.repeat(indentLevel+1) + raw;

      return str;
    };

    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    this.evalForm = function(form, indentLevel) {
      var i, child, text, attrs, line;

      if (Object.isObject(form) && 'type' in form && 'raw' in form) {
        if (form.type == 'tag') {
          if (Object.size(form.attribs)) {
            attrs = self.createAttrString(form.attribs);
          } else {
            attrs = '';
          }

          line = self.indentStr.repeat(indentLevel) + form.name + attrs;
          self.lines.push(line);

          if (Object.isArray(form.children)) {
            i = 0;
            while (child = form.children[i]) {
              i++;
              self.evalForm(child, indentLevel+1);
            }
          }

        } else if (form.type == 'text') {
          text = form.data.replace(/^[\n\s\t]+/, '').replace(/[\n\s\t]+$/, '');
          if (text.length) {
            if (text.length <= self.singleLineTextLimit && ! /^\(/.test(text)) {
              self.lines[self.lines.length-1] += ' ' + text;
            } else {
              line = self.createTextString(text, indentLevel);
              self.lines.push(line);
            }
          }

        } else if (form.type == 'comment') {
          //console.log('COMMENT:\n', form);
        }
      }
    }; // end MananaTranslator.evalForm()

    // . .. ... .. . .. ... .. . .. ... .. . .. ... .. .
    this.translate = function() {
      var i, form;

      self.parser.parseComplete(self.code);
      self.ir = self.handler.dom;

      i = 0;
      while (form = self.ir[i]) {
        ++i;
        self.nextToken = self.ir[i] || null;
        self.evalForm(form, self.indentLevel);
      }

      //console.log(JSON.stringify(self.lines, null, 4));
      console.log(self.lines.join('\n'));
      //console.log(JSON.stringify(self.ir, null, 4));

      /*
      self.lines = self.lines.filter(function(n) { return n !== ''; });

      self.res = self.lines.join('\n');

      return self.res;
      */
    }; // end MananaTranslator.translate()

  }; // end MananaTranslator()



  if (_isServerSide) {
    exports['MananaTranslator'] = MananaTranslator;
  } else {
    window['MananaTranslator'] = MananaTranslator;
  }

})(typeof exports === "undefined" ? {} : exports);
