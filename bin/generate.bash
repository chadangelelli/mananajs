#!/bin/bash

jison lib/grammar.yy lib/lexer.l -o bin/manana_parser.js
cat bin/manana_parser.js lib/interpreter.js > bin/manana.js
node bin/manana.js examples/example1.manana true
