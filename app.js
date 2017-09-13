var express = require('express');
var path = require('path');
var fs = require('fs');
//var isBinaryFile = require('isbinaryfile');
var Handlebars = require('handlebars');

module.exports = (prefix, options) => {
  // Ceate a new express app
  var app = express();

  // Serve static files from the frontend folder
  app.use('/assets', express.static(path.join(__dirname, 'frontend/assets')));

  var homeTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, '/frontend/index.hbs.html')).toString());

  // Main entry
  app.get('/', function(req, res) {
    res.send(homeTemplate({ prefix }));
  });

  return app;
};
