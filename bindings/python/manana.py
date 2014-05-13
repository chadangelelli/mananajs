import json
from Naked.toolshed.shell import muterun_js

class MananaException(Exception):
  pass

class Manana(object):
  def __init__(self, interpreter, node_wrapper, views_dir):
    self.interpreter = interpreter
    self.node_wrapper = node_wrapper
    self.views_dir = views_dir

  def render(self, view_file, context={}):
    self.view = "{0}/{1}".format(self.views_dir, view_file) 
    self.context = context

    self.args = {}
    self.args['interpreter'] = self.interpreter
    self.args['view'] = self.view
    self.args['context'] = self.context

    self.args = '\\"'.join('"{0}"'.format(chunk) for chunk in json.dumps(self.args).split('"'))

    self.response = muterun_js(self.node_wrapper, self.args);

    if self.response.exitcode == 0:
      self.output = self.response.stdout
      return self.output
    else:
      raise MananaException(self.response.stderr)
