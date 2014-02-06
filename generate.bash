#!/bin/bash

if [ -f node_modules/jison/lib/cli.js ]; then
  ./node_modules/jison/lib/cli.js manana.yy manana.l -o manana_parser.js
else
  jison manana.yy manana.l -o manana_parser.js
fi

node manana_parser.js examples/example1.manana
