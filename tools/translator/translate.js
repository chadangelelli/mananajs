#!/usr/bin/env node

var fs = require('fs');
var args = process.argv;
var srcLang = args[2];
var srcFile = args[3];
var srcCode = fs.readFileSync(srcFile, 'utf-8');

var MananaTranslator = require('./translator').MananaTranslator;
var translator = new MananaTranslator({ lang: srcLang, code: srcCode });

var res = translator.translate();

console.log("\n\nGenerated Mañana:");
console.log("\n-------------------------------------------------------\n\n");
console.log(res);
console.log("\n\n");
