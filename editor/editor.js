// __________________________________________________________
window.manana = new Manana();
window.manana_editor = null;
window.context_editor = null;

// __________________________________________________________
function load_manana_editor() {
  var manana_editor, code;
  
  manana_editor = ace.edit("manana_editor");
  manana_editor.setTheme("ace/theme/chrome");
  manana_editor.getSession().setMode("ace/mode/jade");

  code = $('script[data-view-name="manana_code"]').html();
  manana_editor.getSession().setValue(code);

  window.manana_editor = manana_editor;
}

// __________________________________________________________
function load_context_editor() {
  var context_editor, context;
  
  context_editor = ace.edit("context_editor");
  context_editor.setTheme("ace/theme/chrome");
  context_editor.getSession().setMode("ace/mode/javascript");

  context = $("#manana_context").html();
  context_editor.getSession().setValue(context);

  window.context_editor = context_editor;
}

// __________________________________________________________
$(function() {

  // __________________________________________________________
  function render_page(view, target, context) {
    if (typeof context === "undefined") {
      context = {};
    }
    context.__TEMPLATE__ = view;
    $(target).html(manana.render("workspace", context));
  }

  render_page("manana_editor", "#workspace", manana_context);

  load_manana_editor();
  load_context_editor();

  // __________________________________________________________
  $("#manana_editor").on("keyup", function(event) {
    var key, code, context, html; 
    
    key = event.keyCode || event.which; 
    if (key === 13) {
      code = manana_editor.getSession().getValue();
      context = context_editor.getSession().getValue();
      context = context.length ? JSON.parse(context) : {};

      $("#manana_code").html(code);

      try {
        html = manana.render("manana_code", context);
      } catch (e) {
        html = '<div class="bg-danger">' + e.message + '</div>';
      }

      $("#html").html(html);
    }

    return false;
  });

  // __________________________________________________________
});
