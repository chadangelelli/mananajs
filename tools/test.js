#!/usr/bin/env node

var fs = require('fs');
var args = process.argv.slice(2);

var view = args[0];
var context = fs.readFileSync(args[1], 'utf-8') || {};

var basedir = __dirname.split('/');
basedir.pop();
basedir = basedir.join('/');

var Manana = require('../lib/manana_interpreter').Manana;
var manana = new Manana(basedir);

var res = manana.render(view, context); 

console.log("\nRESULT:\n\n" + res + "\n\n");
