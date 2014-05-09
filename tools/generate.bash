#!/bin/bash

if [ -f ../node_modules/jison/lib/cli.js ]; then
  ../node_modules/jison/lib/cli.js ../src/grammar.yy ../src/lexer.l -o ../lib/manana_parser.js
else
  jison ../src/grammar.yy ../src/lexer.l -o ../lib/manana_parser.js
fi
