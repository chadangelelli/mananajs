#!/bin/bash

jison lib/grammar.yy lib/lexer.l -o bin/manana_parser.js
node bin/manana_parser.js examples/example1.manana
#cat bin/manana_parser.js lib/interpreter.js > bin/manana.js
#node bin/manana.js examples/example1.manana
