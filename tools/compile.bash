# This BASH script requires google closure compiler 
# to be installed in the same directory as 'closure-compiler.jar'
# as well as Java >7.
# https://developers.google.com/closure/compiler/

pwd
cat lib/manana_parser.js lib/manana_interpreter.js > bin/manana_src.js

java -jar tools/closure-compiler.jar --js bin/manana_src.js --js_output_file bin/manana.js

rm bin/manana_src.js
