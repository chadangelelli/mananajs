# Mañana

## Copyright
Copyright 2014, Chad Angelelli.

## License
Mañana is released under the Apache License version 2.0. See the LICENSE.txt file for more information.

## Overview
Mañana is a simple, minimal templating language written in Javascript that cross-compiles to HTML. It can run both client- and server-side in the browser or using node.js.  

Mañana's design attemps to be as syntactically minimalistic as possible. It uses Python-style indentation for delimiting code and HTML blocks and does not use special characters or punctuation when they are unnecesary. It lends its influences to Python, Javascript, HAML, YAML and the Jade Templating Language. 

Mañana uses a slightly modified version of Jison for generating its parser. A few additional lines are added to Jison to allow for Python-style indentation by allowing the lexer to return an array of tokens instead of only one at a time.

## Getting Started
A basic HTML template can be written like this:

	html
		head
			title Mañana 
		body
			h1 My First Mañana Template
			div#content
				p Welcome to Mañana!
				
This will cross-compile to the following HTML:

	<html>
		<head>
			<title>Mañana</title>
		</head>
		<body>
			<h1>My First Mañana Template</h1>
			<div id="content">
				<p>Welcome to Mañana!</p>
			</div>
		</body>
	</html>
	
## Writing HTML without having to write HTML.
Like Jade and HAML, Mañana makes it possible to write HTML without coding tags using HTML's syntax. Those familiar with HAML will immediately recognize the ID and CSS class attribute syntax.

#### Syntax:
	
	TAG [ [ID] [CLASSES] [DATA_ATTRIBUTES] [ SPACE [CONTENT]] ]

#### Examples:

	span
	
	span .my-class
	
	span.my-class
	
	div#main.column
	
	div #main .column
	
#### Tag attributes
Attributes in Mañana follow one of two formats. ID and CSS class attributes have shorthand syntax. All attributes can be written with key-value pairs similar to HTML.

All of the following are identical:

	div#main.content
	
	div #main .content
	
	div (id="main", class="content")
	
	div(id="main" class="content")

As you can see spacing does not matter here. All of these will compile and are identical. The comma is also optional and is there simply for readability.

#### Data attributes
HTML5 data attributes can be done in one of two ways in Mañana:

	div (data-example="value")
	
	div ( *example="value" )
 
## Contexts and dealing with data
Like other templating languages you can pass a Context into a Mañana template. 

Mañana uses braces "**{ }**" to delimit variables. 

If we have the following context:

	{
		"first_name": "Chad",
		"last_name": "Angelelli",
		"email": "chad@angelel.li"
	}

We can access these variables with the following syntax:

	span @{first_name} @{last_name} - @{email}

This will produce:

	<span>Chad Angelelli - chad@angelel.li</span>

## Looping 
Mañana has a **for-in** construct much like Python.

Assuming we have the following context:

	{
		"my": {
			"team": [
				{ 
					"name": "Alice",
					"email": "alice@test.com"
				},
				{
					"name": "Bob",
					"email": "bob@test.com"
				},
				{
					"name": "Charlie",
					"email": "charlie@test.com"
				} 
			]
		}
	}

We can interpolate our *my.team* list like this:

	ol.contacts
		for c in my.team
			li @{c.name} - @{c.email}

This will produce:

	<ol class="contacts">
		<li>Alice - alice@test.com</li>
		<li>Bob - bob@test.com</li>
		<li>Charlie - charlie@test.com</li>
	</ol>

## List syntax and slicing
You can slice a list using slice syntax identical to Python's. 

Using our context from above we can do any of the following:
	
	for c in my.team[1:2]
		... starts on the 2nd element, goes to the end
	
	for c in my.team[1:]
		... starts on the 2nd element, goes to the end
		
	for c in my.team[:1]
		... starts at 1st element, goes to 2nd
		
	for c in my.team[1]
		... starts and ends on the 2nd element

## The **with** statement
Another great feature borrowed directly from Python, the **with** statement allows the temporary creation of a variable for the duration of the following block. When the block is executed, the variable is automatically deleted. **with** makes a clone of the variable it references so the original can not be effected.

#### Usage:
Still using our context from above and our contacts example:

	with my.team[1:] as contacts
		ol.contacts
			for c in contacts
				li @{c.name} - @{c.email}
	
This code creates a variable named *contacts* that contains all but the first element in the *my.team* list. We access our contacts variable in our for-loop. If nothing else **with** can make a template more readable.

## The **alias** statement
While Mañana's philosophy doesn't support settinig variables to arbitrary values, it does support aliasing other variables for the purpose of readability. **alias** is in some ways like **with** but differs in that once a variable exists it is set for the life of the template.

#### Usage:
To use alias do the following:

	alias contacts = my.team
	alias first_contact = contacts[0]
	alias last_contact = contacts[2]

This first creates a reference to *my.team* called *contacts*. We then create two more references for our first and last element in the list.

## Accessing variables not in the current context
Mañana can also access anything in memory. 
