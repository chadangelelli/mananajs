#!/bin/bash
node_modules/jison/lib/cli.js src/grammar.y src/lexer.l -o lib/manana_parser.js
