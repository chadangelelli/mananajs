" Vim syntax file
" Language: Mañana 
" Last Change:  2014 Jun 11 
" Maintainer: Chad Angelelli <chad@angelel.li>
" Original author: Chad Angelelli <chad@angelel.li>

" Initializing:

if exists("b:current_syntax")
  finish
endif

let s:cpo_save = &cpo
set cpo&vim

" Operators
" Conditions

" Tags
syn match mananaTag '^\s*[a-zA-Z][a-zA-Z0-9]*'

" Names
syn region mananaName matchgroup=Type start="@{" matchgroup=Type end="}" contains=ALL 

" Strings
syn region mananaString start=+\%(\\\)\@<!"+ skip=+\\[\\"]+ end=+"+ contains=@Spell
syn region mananaString start=+\%(\\\)\@<!'+ skip=+\\[\\']+ end=+'+ contains=@Spell

" Functions
syn match mananaFunc '^\s*@[a-zA-Z][a-zA-Z]*()'
syn match mananaFunc '^\s*@[a-zA-Z][a-zA-Z]*(.*)'

" Comments:
syn region mananaComment start='"""' end='"""' contains=@Spell

" Synchronization and the wrapping up...
syn sync match matchPlace grouphere NONE "^[^ \t]"
" ... i.e. synchronize on a line that starts at the left margin

" Define the default highlighting.
" For version 5.7 and earlier: only when not done already
" For version 5.8 and later: only when an item doesn't have highlighting yet
if version >= 508 || !exists("did_manana_syntax_inits")
  if version < 508
    let did_manana_syntax_inits = 1
    command -nargs=+ HiLink hi link <args>
  else
    command -nargs=+ HiLink hi def link <args>
  endif

  HiLink mananaTag        Special
  HiLink mananaName       Statement
  HiLink mananaString     String
  HiLink mananaFunc       Function
  HiLink mananaComment    Comment

  delcommand HiLink
endif

let b:current_syntax = "manana"

let &cpo = s:cpo_save
unlet s:cpo_save
