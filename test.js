#!/usr/bin/env node

var context = {
  "test_date": '2012-12-12T00:00:00Z',
  "test_id": "5383838559a04d5f1067db38",
  "roles": {
      "111": "Role 1",
      "222": "Role 2",
      "333": "Role 3"
  },
  "my": {
    "team": [
      {
        "first_name": "Alice",
        "last_name": "A",
        "email": "alice@a.com",
        "role": "111"
      },
      {
        "first_name": "Bob",
        "last_name": "B",
        "email": "bob@b.com",
        "role": "222"
      },
      {
        "first_name": "Charlie",
        "last_name": "C",
        "email": "charlie@c.com",
        "role": "333"
      },
      {
        "first_name": "David",
        "last_name": "D",
        "email": "david@d.com"
      },
      {
        "first_name": "Eddie",
        "last_name": "E",
        "email": "eddie@e.com",
        "role": "555"
      }
    ]
  }
};

var Manana = require('./manana_interpreter'),
    manana = new Manana.Manana('./examples/');

manana.add_fn('test', function(x, y) {
  return x + y;
});

var res = manana.render('1', context); 

//console.log("\nIR: " + JSON.stringify(manana.ir, null, 4) + "\n");
//console.log("\nContext: " + JSON.stringify(manana.context, null, 4) + "\n");
//console.log("\nNamespace: " + JSON.stringify(manana.namespace, null, 4) + "\n");

//var brew = manana.bottle(manana.template);
//console.log("\nBREW: " + brew);

//console.log(" ");
//var deliciousness = manana.unbottle(brew);
//console.log(JSON.stringify(deliciousness, null, 4));

console.log("\nRESULT:\n\n" + res + "\n\n");
