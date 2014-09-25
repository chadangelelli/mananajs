unlet b:current_syntax
syn include @manana ~/.vim/syntax/manana.vim
syn region htmlTemplate start=+<script [^>]*type *=[^>]*text/x-manana[^>]*>+
\                       end=+</script>+me=s-1 keepend
\                       contains=@manana,htmlScriptTag,@htmlPreproc
