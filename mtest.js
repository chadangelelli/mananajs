
var Manana = require('./manana_interpreter'),
    manana = new Manana.MananaInterpreter(),
    fs = require('fs'),
    code = fs.readFileSync('./examples/example1.manana', {encoding: 'utf-8'});

var context = {
  my: {
    team: [
      {
        first_name: 'Alice',
        last_name: 'A',
        email: 'alice@a.com'
      },
      {
        first_name: 'Bob',
        last_name: 'B',
        email: 'bob@b.com'
      },
      {
        first_name: 'Charlie',
        last_name: 'C',
        email: 'charlie@c.com'
      },
    ]
  }
};

var res = manana.eval(code, context); 

console.log(JSON.stringify(res, null, 4));
