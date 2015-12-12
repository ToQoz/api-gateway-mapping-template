var http = require('https');
var parseUrl = require('url').parse;
var Promise = require('bluebird');

module.exports = post;

function post(url, headers, data) {
  return new Promise(function(resolve, reject) {
    var u = parseUrl(url);

    var options = {
      hostname: u.hostname,
      port: 443,
      path: u.path,
      method: 'POST',
      headers: headers
    };

    var req = http.request(options, function(res) {
      res.setEncoding('utf8');

      var responseBody = '';

      res.on('data', function (chunk) {
        responseBody += chunk;
      });

      res.on('end', function() {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseBody
        });
      });

      req.on('error', function(err) {
        reject(err);
      });
    });

    req.setTimeout(5 * 1000, function() {
      reject("timeout: POST " + url);
    });

    req.write(data);
    req.end();
  });
}
