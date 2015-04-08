#!/usr/bin/env node

function puts() {
  Function.apply.call(console.log, console, arguments);
}

var p = /^[^\s]((?!@\{).)*$/

// does not start with space, followed by anything that is not "@{"

var tests = [
  [true, 'abc'],
  [true, 'a'],
  [true, 'a '],
  [true, 'a b'],

  [false, ''],
  [false, ' abc'],
  [false, 'abc@{x}']
];

var i = 0, 
    l = tests.length,
    passed = 0,
    failed = 0,
    test;
for (; i < l; i++) {
  test = tests[i];

  if (p.test(test[1]) === test[0]) {
    res = true;
    passed++;
  } else {
    res = false;
    failed++;
  }

  puts(i + '. ', (res ? 'PASS' : 'FAIL'), (p.test(test[1]) + '<>' + test[0]), '==> "' + test[1] + '" ');
}
puts('\nresults:\n\tpassed: ' + passed + '\n\tfailed: ' + failed + '\n');
