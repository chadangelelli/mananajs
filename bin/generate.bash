#!/bin/bash
jison src/manana.yy src/manana.l -o bin/manana_parser.js
node bin/manana_parser.js examples/example1.manana
