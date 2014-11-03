#!/bin/bash
node_modules/jison/lib/cli.js \
    src/manana.y              \
    src/manana.l              \
    -o lib/manana_parser.js
