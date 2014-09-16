# Mañana

## Copyright
Copyright 2014, Chad Angelelli.

## License
Mañana is released under the Apache License version 2.0. See the LICENSE.txt file for more information.

## Overview
Mañana is a simple, minimal templating language written in Javascript that cross-compiles to HTML. It can run both client- and server-side in the browser or using node.js.  

Mañana's design attemps to be as syntactically minimalistic as possible. It uses Python-style indentation for delimiting code and HTML blocks and does not use special characters or punctuation when they are unnecesary. It lends its influences to Python, Javascript, HAML, YAML and the Jade Templating Language. 

Mañana uses a slightly modified version of Jison for generating its parser. A few additional lines are added to Jison to allow for Python-style indentation by allowing the lexer to return an array of tokens instead of only one at a time.

## Documentation
Documentation can be [found here](http://chad.angelel.li/manana).
