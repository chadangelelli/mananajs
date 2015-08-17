#!/usr/bin/env node

var fs = require('fs');
var args = process.argv.slice(2);

var basedir = __dirname.split('/');
basedir.pop();
basedir = basedir.join('/');

var view = basedir + '/' + args[0];

var context;
try {
  context = require(basedir + '/' + args[1]);
} catch (e) {
  context = {};
}

var Manana = require(basedir + '/lib/manana_interpreter').Manana;
var manana = new Manana(basedir);

var res = manana.render({
  view: view,
  context: context,
  options: {
    format: {
      indent: 4,
      indent_char: " ",
      max_line_length: 72
    }
  }
}); 

console.log("\nRESULT:\n\n" + res + "\n\n");
