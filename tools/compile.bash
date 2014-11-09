# This BASH script requires google closure compiler 
# to be installed in the same directory as 'closure-compiler.jar'
# as well as Java >7.
# https://developers.google.com/closure/compiler/

pwd
cat lib/manana_parser.js lib/manana_interpreter.js > bin/manana.uncompiled.js

java -jar tools/closure-compiler.jar --js bin/manana.uncompiled.js --js_output_file bin/manana.js
