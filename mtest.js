
var Manana = require('./interpreter'),
    manana = new Manana.MananaInterpreter(),
    fs = require('fs'),
    code = fs.readFileSync('./examples/example1.manana', 'utf-8');

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
      {
        first_name: 'David',
        last_name: 'D',
        email: 'david@d.com'
      },
      {
        first_name: 'Eddie',
        last_name: 'E',
        email: 'eddie@e.com'
      }
    ]
  },
  "numbers": {
    "a": 1,
    "b": 2,
    "c": 3
  }
};

var res = manana.eval(code, context); 

//console.log("\n" + JSON.stringify(manana.ir, null, 4) + "\n");
//console.log("\n" + JSON.stringify(manana.ir));
console.log("\nRESULT:\n" + JSON.stringify(res, null, 4) + "\n\n");
