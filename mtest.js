
var Manana = require('./manana_interpreter'),
    manana = new Manana.MananaInterpreter(),
    fs = require('fs'),
    code = fs.readFileSync('./examples/example1.manana', {encoding: 'utf-8'});

var res = manana.eval(code); 

console.log(JSON.stringify(res, null, 4));
