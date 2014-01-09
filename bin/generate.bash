#!/bin/bash

if [ -f node_modules/jison/lib/cli.js ]; then
  ./node_modules/jison/lib/cli.js src/manana.yy src/manana.l -o bin/manana_parser.js
else
  jison src/manana.yy src/manana.l -o bin/manana_parser.js
fi

node bin/manana_parser.js examples/example1.manana
