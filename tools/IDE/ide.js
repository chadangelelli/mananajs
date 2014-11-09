$(function() {
  var $body;

  // __________________________________________________ globals
  window.manana = new Manana();
  window.view_directory = {};
  window.views = {};
  window.cur_view;


  // __________________________________________________ locals 
  $body = $('body');


  // __________________________________________________ prototypes
  String.prototype.intpol = function(o) {
    return this.replace(/{([^{}]*)}/g,
      function (a, b) {
        var r = o[b];
        return typeof r === 'string' || typeof r === 'number' ? r : a;
      }
    );
  };


  // __________________________________________________ functions
  function View($view) {
    var name      = $view.attr('data-view-name');
    this.$view    = $view;
    this.name     = name
    this.target   = $view.attr('data-view-target');
    this.template = $view.html();
    this.html     = manana.render(name);
  }

  function render(view_name) {
    var view;

    if (typeof views[view_name] === 'undefined') {
      views[view_name] = new View(view_directory[view_name]);
    }

    view = views[view_name];

    if ( ! $(view.target).length) {
      console.log('Unknown target "{target}" for view "{name}"'.intpol(view));
    }

    $(view.target).html(view.html);
  }


  // __________________________________________________ view handlers

  // pre-register all views in view_directory{}
  $('script[type="text/x-manana"]').each(function(index) {
    var $this, name;

    $this = $(this);
    name = $this.attr('data-view-name');

    view_directory[name] = $this;
  });

  // render workspace
  render('workspace');

  // render home
  if (location.hash.length) {
    render(location.hash.slice(1));
  } else {
    render('home');
  }

  // view links 
  $body.on('click', '.navbar a', function() {
    var $this, href, view;

    $this = $(this);
    href = $this.attr('href');

    if (href[0] == '#') {
      view_name = href.slice(1);
      render(view_name);
    }
  });


  // __________________________________________________ events
  $body.on('click', 'a[data-toggle="modal"]', function() {
    var $this, title, view;

    $this = $(this);
    title = $this.text();
    view = $this.attr('data-view');

    $("#home-modal-title").html(title);

    render(view);
  });


  code_editor = ace.edit("code_editor");

  code_editor.setTheme("ace/theme/chrome");
  code_editor.getSession().setMode("ace/mode/jade");

  manana_code = $('script[data-view-name="base"]').html();
  code_editor.getSession().setValue(manana_code);


  /*
  var code, context;

  // __________________________________________________ set up Mañana
  window.manana = new Manana();
  window.manana_code = '';
  window.manana_context = { 'window': window };
  window.code_editor;
  window.context_editor;
  window.current_view;
  window.view_list = [];

  // __________________________________________________ get views list 
  $('script[type="text/x-manana"]').each(function(index) {
      var $this = $(this);
      view_list.push($this.attr('data-view-name'));
  });

  // __________________________________________________ render main workspace
  $("#workspace").html(manana.render("workspace", manana_context));

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
    var format, err = '';

    manana_code = code_editor.getSession().getValue();
    manana_context = JSON.parse(context_editor.getSession().getValue());
    current_view = $("#current_view").html();
    format = $("#preview_options #preview_format").val();

    $('script[data-view-name="' + current_view + '"]').html(manana_code);

    //var x = manana.render(current_view, manana_context);
    //var y = manana.bottle(manana_code, manana_context);
    //console.log("Mañana bottled: ");
    //console.log(y);
    //var z = manana.unbottle(y);
    //console.log("Mañana unbottled: ");
    //console.log(z);

    try {
      $("#preview").html(manana.render(current_view, manana_context));
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
