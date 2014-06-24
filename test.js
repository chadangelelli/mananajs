#!/usr/bin/env node

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

var Manana = require('./manana_interpreter'),
    manana = new Manana.Manana();

var res = manana.render('examples/1.manana', context); 

console.log("\nIR: " + JSON.stringify(manana.ir, null, 4) + "\n");
console.log("\nContext: " + JSON.stringify(manana.context, null, 4) + "\n");

var brew = manana.bottle(manana.template);
console.log("\nBREW: " + brew);

console.log(" ");
var deliciousness = manana.unbottle(brew);
console.log(JSON.stringify(deliciousness, null, 4));

console.log("\nRESULT:\n\n" + res + "\n\n");
