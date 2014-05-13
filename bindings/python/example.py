#!/usr/bin/env python
import os
from manana import Manana, MananaException

context = {
  "my": {
    "team": [
      {
        "first_name": "Alice",
        "last_name": "A",
        "email": "alice@a.com"
      },
      {

        "first_name": "Bob",
        "last_name": "B",
        "email": "bob@b.com"
      },
      {
        "first_name": "Charlie",
        "last_name": "C",
        "email": "charlie@c.com"
      },
      {
        "first_name": "David",
        "last_name": "D",
        "email": "david@d.com"
      },
      {
        "first_name": "Eddie",
        "last_name": "E",
        "email": "eddie@e.com"
      }
    ]
  }
}

cur_dir = os.path.dirname(os.path.realpath(__file__))
par_dir = os.path.abspath(os.path.join(cur_dir, os.pardir))

interpreter  = '/home/manana/manana_interpreter'
node_wrapper = "{0}/{1}".format(par_dir, 'manana.js')
views_dir    = par_dir

manana = Manana(interpreter, node_wrapper, views_dir)
print manana.render('test.manana', context)
