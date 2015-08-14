#!/usr/bin/env node

var sys, fs, args, srcLang, srcFile, srcCode, MananaTranslator, translator, res;

sys = require('sys');
fs = require('fs');
args = process.argv;
srcLang = args[2];
srcFile = args[3];
srcCode = fs.readFileSync(srcFile, 'utf-8');
MananaTranslator = require('./translator').MananaTranslator;
translator = new MananaTranslator({ lang: srcLang, code: srcCode });
res = translator.translate();
