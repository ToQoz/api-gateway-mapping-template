var http = require('https');
var parseUrl = require('url').parse;
var Promise = require('bluebird');

module.exports = function (url, examples) {
  var q = examples.map(function(ex, i) {
    var req = function() { return post(url, extend({}, ex.headers, {'Content-Type': "text/test-" + i}), ex.payload); };
    return req()
    .then(function(res) {
      if (res.statusCode === 500) {
        return wait(1000)().then(req);
      }

      res.headers = ex.headers;
      res.template = ex.template;
      res.payload = ex.payload;
      return res;
    });
  });

  return Promise.all(q);
};

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

function wait(delay) {
  return function() {
    return new Promise(function(resolve) {
      setTimeout(function() { resolve(); }, delay);
    });
  };
}

function extend(target) {
  var sources = [].slice.call(arguments, 1);
  sources.forEach(function (source) {
    for (var prop in source) {
      target[prop] = source[prop];
    }
  });
  return target;
}
