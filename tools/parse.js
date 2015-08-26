#!/usr/bin/env node

var fs = require('fs');
var args = process.argv.slice(2);

var basedir = __dirname.split('/');
basedir.pop();
basedir = basedir.join('/');

var Manana = require(basedir + '/lib/manana_interpreter').Manana;
var manana = new Manana(basedir);

var view = fs.readFileSync(basedir + '/' + args[0], 'utf-8');
var res = manana.parser.parse(view);

console.log("\nRESULT:\n\n" + JSON.stringify(res, null, 4) + "\n\n");
