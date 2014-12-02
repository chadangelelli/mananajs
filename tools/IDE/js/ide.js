$(function() {
  var $body;

  window.manana = new Manana();
  window.viewDirectory = {};
  window.views = {};
  window.currentView;
  $body = $('body');

  String.prototype.intpol = function(o) {
    return this.replace(/{([^{}]*)}/g,
      function (a, b) {
        var r = o[b];
        return typeof r === 'string' || typeof r === 'number' ? r : a;
      }
    );
  };

  function View($view) {
    var name      = $view.attr('data-view-name');

    this.$view    = $view;
    this.name     = name
    this.target   = $view.attr('data-view-target') || null;
    this.template = $view.html();
    this.html     = manana.render(name);
  }

  // pre-register all views in viewDirectory{}
  $('script[type="text/x-manana"]').each(function(index) {
    var $this, name;

    $this = $(this);
    name = $this.attr('data-view-name');

    viewDirectory[name] = $this;
  });

  function render(viewName) {
    var view;

    if (typeof views[viewName] === 'undefined') {
      views[viewName] = new View(viewDirectory[viewName]);
    }

    view = views[viewName];

    if ( ! $(view.target).length) {
      console.log('Unknown target "{target}" for view "{name}"'.intpol(view));
    }

    $(view.target).html(view.html);
  }

  function createEditors() {
    viewEditor = ace.edit('view-editor');
    viewEditor.setTheme('ace/theme/chrome');
    viewEditor.getSession().setMode("ace/mode/jade");
    viewEditor.setFontSize(14);
    viewEditor.getSession().setValue(manana.getTemplate('welcome-message'));

    contextEditor = ace.edit('context-editor');
    contextEditor.setTheme('ace/theme/chrome');
    contextEditor.getSession().setMode("ace/mode/javascript");
    contextEditor.setFontSize(14);
    contextEditor.getSession().setValue(JSON.stringify(manana_contexts.team, null, 4));

    cssEditor = ace.edit('css-editor');
    cssEditor.setTheme('ace/theme/chrome');
    cssEditor.getSession().setMode("ace/mode/css");
    cssEditor.setFontSize(14);
  }

  // render workspace
  render('workspace');

  // render home
  if (location.hash.length) {
    var viewName = location.hash.slice(1);
    render(viewName);
    if (viewName == 'home') {
      createEditors();
    }
  } else {
    render('home'); 
    createEditors();
  }

  // view links 
  $body.on('click', '.navbar a', function() {
    var $this, href, view;

    $this = $(this);
    href = $this.attr('href');

    if (href[0] == '#') {
      viewName = href.slice(1);
      render(viewName);
      if (viewName == 'home') {
        createEditors();
      }
    }
  });

  $body.on('change', '#available-contexts', function() {
    var $this, choice, context;

    $this = $(this);
    choice = $this.val();
    context = JSON.stringify(manana_contexts[choice], null, 4);

    contextEditor.getSession().setValue(context);
  });

  $body.on('change', '#available-views', function() {
    var $this, choice, code;

    $this = $(this);
    choice = $this.val();
    code = viewDirectory[choice].html();

    viewEditor.getSession().setValue(code);
  });

  function preview() {
    var code, context, css, scratchDisk, html;

    code = viewEditor.getSession().getValue() 

    code = code + '\n'; 
      // This is a hack for Ace Editor to not break when there's no <<EOF>> token
      // Mañana is either file based or <script> tag based so we just inject a newline
      // to keep the parser from not recognizing the last token..

    context = contextEditor.getSession().getValue().replace(/^\s*/, '').replace(/\s*$/, '');
    if ( ! context) {
      context = {};
    } else {
      context = JSON.parse(context);
    }

    css = '<style>' + cssEditor.getSession().getValue() + '</style>';

    scratchDisk = $('script[data-view-name="scratch-disk-view"]')
    scratchDisk.html(code);
    html = manana.render('scratch-disk-view', context);

    $('#preview-modal-body').html(css + html);
    $('#preview-modal').modal('show');
  }

  $body.on('click', '#view-editor-preview', function() {
    preview();
  });

  $body.on('click', '#view-editor-add', function() {
    var existingViews;

    $('#add-modal').modal('show');

    existingViews = $('#available-views')
                      .clone()
                      .prop('name', 'existing_view_name')
                      .prop('id', 'existing_view_name');
    $('#existing-views').html(existingViews);
    $('#existing_view_name option:first').text('* Select a view to overwrite');

    return false;
  });

  $body.on('submit', '#add-view-form', function() {
    var $formStatus, data, overwriteExisting, $view, code;
    
    data = {}, $formFields = {};
    $(this).find(':input:not("button")').each(function() {
      var $this = $(this);
      data[$this.prop('name')] = $this.val()
      $this.val('');
    });

    $formStatus = $('#add-view-form-status');
    if ( ! data.view_name && ! data.existing_view_name) {
      $formStatus.addClass('alert').addClass('alert-warning');
      $formStatus.html('Please enter a name or select an existing view to overwrite');
      return false;
    } else if (data.view_name && data.existing_view_name) {
      $formStatus.addClass('alert').addClass('alert-warning');
      $formStatus.html('You can not name a view and select an existing one, please pick one or the other');
      return false;
    }

    overwriteExisting = data.existing_view_name.length > 0;

    $formStatus.removeClass('alert').removeClass('alert-warning');
    $formStatus.text('');

    data.code = viewEditor.getSession().getValue() + "\n";
      // This is a hack for Ace Editor to not break when there's no <<EOF>> token
      // Mañana is either file based or <script> tag based so we just inject a newline
      // to keep the parser from not recognizing the last token..

    if (overwriteExisting) {
      $('script[data-view-name="{existing_view_name}"]'.intpol(data)).html(data.code);
    } else {
      $view = $('script[data-view-name="{view_name}"]'.intpol(data));
      if ($view.length) {
        $view.html(data.code);
      } else {
        $body.append('<script type="text/x-manana" data-view-name="{view_name}">{code}</script>'.intpol(data));
        $('#user-defined-view-list').append('<option value="{view_name}">{view_name}</option>'.intpol(data));
        $('#available-views').val(data.view_name);
        $view = $('script[data-view-name="{view_name}"]'.intpol(data));
        viewDirectory[data.view_name] = $view;
        try {
          views[data.view_name] = new View($view);
        } catch (e) {
          console.log(e);
          $formStatus.addClass('alert').addClass('alert-warning');
          $formStatus.html('<pre>{message}</pre>'.intpol(e));
          return false;
        }
      }
    }

    $('#add-modal').modal('hide');

    return false;
  });

  $body.on('keyup', function(event) {
    var key = event.keyCode || event.which;
    if (key === 13 && event.shiftKey) {
      preview();
      return false;
    }
  });

  $body.on('change', '#keymode', function() {
    var $this, mode;

    $this = $(this);
    mode = $this.val();
    mode = mode ? "ace/keyboard/" + $this.val() : '';

    viewEditor.setKeyboardHandler(mode);
    contextEditor.setKeyboardHandler(mode);
    cssEditor.setKeyboardHandler(mode);
  });

  /*
  window.onbeforeunload = function() {
    return 'All changes will be lost!';
  };
  */
});
