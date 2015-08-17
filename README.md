# Mañana

## Copyright
Copyright 2014, Chad Angelelli.

## License
Mañana is released under the Apache License version 2.0. See the LICENSE.txt file for more information.

## Overview
Mañana is a simple, minimal templating language written in Javascript that cross-compiles to HTML. It can run both client- and server-side in the browser or using node.js.  

Mañana's design attemps to be as syntactically minimalistic as possible. It uses Python-style indentation for delimiting code and HTML blocks and does not use special characters or punctuation when they are unnecesary. It lends its influences to Python, Javascript, HAML, YAML and the Jade Templating Language. 

Mañana uses a slightly modified version of Jison for generating its parser. A few additional lines are added to Jison to allow for Python-style indentation by allowing the lexer to return an array of tokens instead of only one at a time.

## Usage
### node.js
    var Manana = require('/path/to/manana/lib/manana_interpreter').Manana;
    var manana = new Manana('/path/to/views/directory');
    
    var view_name = 'my_view';
    
    var context = {
        "message": "Welcome to Mañana!"
    }
    
    var view = manana.render(view_name, context)

### browser
    <script src="/static/js/manana/lib/manana_parser.js"></script>
    <script src="/static/js/manana/lib/manana_interpreter.js"></script>
    
    <script type="text/x-manana" data-view-name="my_view">
        h1 @{message}
    </script>
    
    <script>
        window.manana = new Manana();
        
        var context = {
            "message": "Welcome to Mañana!"
        }
        
        var view = manana.render('my_view', context);
    </script>

## Documentation
Documentation can be [found here](http://chad.angelel.li/manana).
