#!/usr/bin/env node

var fs = require('fs');
var args = process.argv.slice(2);

var basedir = __dirname.split('/');
basedir.pop();
basedir = basedir.join('/');

var Manana = require(basedir + '/lib/manana_interpreter').Manana;

var manana = new Manana({
  path: basedir,
  format: {
    indent: 4,
    indent_char: " ",
    max_line_length: 72
  },
  history: {
    on: true,
    limit: 10
  }
});

var tests = [
  ["examples/unit-tests/0.text-output.manana", "examples/contexts/team.js"],
  ["examples/unit-tests/1.strings.manana"    , "examples/contexts/team.js"],
  ["examples/unit-tests/2.conditions.manana" , "examples/contexts/team.js"],
  ["examples/unit-tests/3.loops.manana"      , "examples/contexts/team.js"],
  ["examples/unit-tests/4.switches.manana"   , "examples/contexts/team.js"],
  ["examples/unit-tests/5.with.manana"       , "examples/contexts/team.js"],
  ["examples/unit-tests/6.code.manana"       , "examples/contexts/team.js"],
  ["examples/unit-tests/7.attributes.manana" , "examples/contexts/team.js"]
];

var test, view, context, i;

i = 0; 
while (test = tests[i]) {
  console.log("\n============================================================");
  console.log("view   : " + test[0]);
  console.log("context: " + test[1] + "\n\n");

  view = basedir + '/' + test[0];
  context = require(basedir + '/' + test[1]);

  res = manana.render(view, context);

  console.log("\nRESULT:\n\n" + res + "\n\n");

  console.log("\nFAMILY: " + JSON.stringify(manana.history.family) + "\n\n");
  console.log("\nANCESTRY: " + JSON.stringify(manana.history.ancestry) + "\n\n");
  console.log("\nCHRONOLOGY: " + JSON.stringify(manana.history.chronology) + "\n\n");

  i++;
}

