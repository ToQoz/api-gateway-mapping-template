var fs = require('fs');

var express = require('express');
var app = express();
// enable to get request body in a handler...
app.use(function(req, res, next) {
  req.rawBody = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk) { req.rawBody += chunk; });
  req.on('end', function() { next(); });
});

var mappingTemplate = require("../..");

app.post("/", function(req, res) {
  fs.readFile(__dirname + "/mapping_template.vtl", function(err, data) {
    var template = data.toString();
    var payload = req.rawBody;

    var json = mappingTemplate({
      template: template,
      payalod: payload,
      params: {
        header: req.headers,
        path: req.params,
        querystring: req.query
      }
    });
    var event = JSON.parse(json);

    require("./lambda").handler(event, {succeed: res.send.bind(res)});
  });
});

app.listen(3000);
