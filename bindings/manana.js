
var fs = require('fs');
var args = JSON.parse(process.argv.slice(2)[0]);

var Manana = require(args.interpreter);
var manana = new Manana.Manana();

var res = manana.render(args.view, args.context);

console.log(res);
