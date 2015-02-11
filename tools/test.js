#!/usr/bin/env node

var fs = require('fs');
var args = process.argv.slice(2);

var basedir = __dirname.split('/');
basedir.pop();
basedir = basedir.join('/');

var view = basedir + '/' + args[0];
var context = require(basedir + '/' + args[1]);

/*
var Manana = require(basedir + '/bin/manana').Manana;
*/
var Manana = require(basedir + '/lib/manana_interpreter').Manana;
var manana = new Manana(basedir);

var res = manana.render(view, context); 

console.log("\nRESULT:\n\n" + res + "\n\n");
