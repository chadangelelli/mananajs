#!/bin/bash

if [ -f node_modules/jison/lib/cli.js ]; then
  node_modules/jison/lib/cli.js grammar.yy lexer.l -o manana_parser.js
else
  jison grammar.yy lexer.l -o manana_parser.js
fi
