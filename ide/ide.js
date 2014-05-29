$(function() {
  var code, context;

  window.manana = new Manana();
  window.manana_code = '';
  window.manana_context = { 'window': window };
  window.code_editor;
  window.context_editor;
  window.current_view;
  window.view_list = [];

  function getView(name) {
    var $view = $('script[data-view-name="' + name + '"]');
    $view.template = $view.html();
    return $view;
  }

  $("#workspace").html(manana.render("workspace", manana_context));
  $("#page").html(manana.render("dashboard", manana_context));

  $(".navbar a, .nav a, .main-link a").on("click", function(evt) {
    var $this, name, target, view;

    $this = $(this);
    name = $this.attr("href").slice(1);
    target = "#page";
    view = manana.render(name, manana_context);
    $(target).html(view);

  });

  /*
  // __________________________________________________ set up Ace Editor for code
  code_editor = ace.edit("code_editor");

  code_editor.setTheme("ace/theme/chrome");
  code_editor.getSession().setMode("ace/mode/jade");

  manana_code = $('script[data-view-name="base"]').html();
  code_editor.getSession().setValue(manana_code);

  // __________________________________________________ Set up Ace Editor for context
  context_editor = ace.edit("context_editor");

  context_editor.setTheme("ace/theme/chrome");
  context_editor.getSession().setMode("ace/mode/javascript");

  context = $("#manana_context").html();
  context_editor.getSession().setValue(context);

  // __________________________________________________ functions/wrappers 
  function preview() {
    var format, res, err = '';

    manana_code = code_editor.getSession().getValue();
    manana_context = JSON.parse(context_editor.getSession().getValue());
    current_view = $("#current_view").html();

    $('script[data-view-name="' + current_view + '"]').html(manana_code);

    res = manana.render(current_view, manana_context);

    format = $("#preview_options #preview_format").val();
    if (format == 'html') {
      res = '<pre>' + manana.encode(res) + '</pre>';
    }

    try {
      $("#preview").html(res);
    } catch (e) {
      err = '<h2>Error!</h2>' +
            '<pre class="bg-danger">' + 
            e.message +
            '</pre>' + 
            '<p>Check console for more info.</p>';

      if (typeof e.loc !== "undefined") {
        err +=
            '<pre>' + 
              'start: ' + e.loc.start.line + ':' + e.loc.start.column + '\n' + 
              'end: ' + e.loc.end.line + ':' + e.loc.end.column + '\n' + 
            '</pre>';
      }

      $("#preview").html(err);
      console.log(e);
      console.log("view: ", manana.view);
      console.log("context: ", manana.view.context);
    }
  }

  // __________________________________________________ events
  $("#current_view").html('base');
  preview();

  $(".editor-loader").on("click", function(evt) {
    var view, code, $this;

    $this = $(this);
    view = $this.attr('href').slice(1);
    code = $('script[data-view-name="' + view + '"]').html();

    // save current code
    $('script[data-view-name="' + current_view + '"]').html(code_editor.getSession().getValue());

    // set new code and current view
    code_editor.getSession().setValue(code);
    $("#current_view").html(view);

    return false;
  });

  $("#code_editor").on("keyup", function(event) {
    var key = event.keyCode || event.which; 

    if (key === 13 && event.shiftKey) {
      preview();
    }

    return false;
  });
  */

});
