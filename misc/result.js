var fs = require('fs');
var crypto = require('crypto');

var sprintf = require("sprintf-js").sprintf;
var Promise = require('bluebird');

module.exports = function(results) {
  return new Promise(function(resolve, reject) {
    var testOut = process.env.TEST ? fs.createWriteStream(process.env.TEST) : process.stdout;
    var markdownOut = process.env.MD ? fs.createWriteStream(process.env.MD) : process.stdout;

    results = results.map(function(result) {
      var r = new Result();
      r.mappingTemplate = result.template;
      r.requestBody = result.payload;
      r.requestHeaders = result.headers;
      r.statusCode = result.statusCode;
      r.responseBody = result.body;
      return r;
    });

    // write markdown
    results.forEach(function(r, i) {
      markdownOut.write(sprintf("## example-%s\n", hash(JSON.stringify(r))));
      r.toMarkdown(markdownOut);
    });

    // write test
    testOut.write(sprintf("// This file is generated by `TEST=%s node misc/gen.js`\n", process.env.TEST));
    testOut.write("\n");
    testOut.write("var assert = require('assert')\n");
    testOut.write("var mappingTemplate = require('../')\n");
    testOut.write("\n");
    testOut.write("describe('$input.path|$input.json', function() {\n");

    var mdUrl = "https://github.com/ToQoz/api-gateway-mapping-template/blob/master/test/_.md";
    results.forEach(function(r, i) {
      testOut.write(sprintf("  // %s#example-%s\n", mdUrl, hash(JSON.stringify(r))));
      r.toTest(testOut, 1);
    });

    testOut.write("});");

    resolve();
  });
};

function Result() {
  this.mappingTemplate = null;
  this.requestBody = null;
  this.requestHeaders = null;
  this.statusCode = null;
  this.responseBody = null;
}

Result.prototype.toMarkdown = function(out) {
  var s = "";
  var header = Object.keys(this.requestHeaders).map(function(k) { return k + " : " + this.requestHeaders[k]; }.bind(this)).join("\n");

  var h = ["Template", "Header", "Payload", "Status code", "Result"];
  s += h.join("|") + "\n";
  s += h.map(function(v) { return v.replace(/./g, "-"); }).join("|") + "\n";

  s += [
    "`" + this.mappingTemplate + "`",
    "`" + (header || "None") + "`",
    "`" + this.requestBody + "`",
    "`" + this.statusCode + "`",
    "`" + this.responseBody + "`",
  ].join("|");

  out.write(s);
  out.write("\n\n");
};

Result.prototype.toTest = function(out, indentLevel) {
  var indent = "";
  for (var i = 0; i < indentLevel; i++) {
    indent += "  ";
  }

  if (this.statusCode !== 200 || this.responseBody.indexOf("{errorMessage=Unable") === 0) {
    out.write(sprintf(indent + "describe('H=`%s` P=`%s` ===> T=`%s`', function() {\n", JSON.stringify(this.requestHeaders).replace(/'/g, "\\'"), this.requestBody.replace(/'/g, "\\'"), this.mappingTemplate.replace(/'/g, "\\'")));
    out.write(indent         + "  it('throw error', function() {\n");
    out.write(sprintf(indent + "    assert.throws(function() { mappingTemplate({template: %s, payload: %s}); });\n", JSON.stringify(this.mappingTemplate), JSON.stringify(this.requestBody)));
    out.write(        indent + "  });\n");
    out.write(        indent + "});\n");
  } else {
    out.write(sprintf(indent + "describe('H=`%s` P=`%s` ===> T=`%s`', function() {\n", JSON.stringify(this.requestHeaders).replace(/'/g, "\\'"), this.requestBody.replace(/'/g, "\\'"), this.mappingTemplate.replace(/'/g, "\\'")));
    out.write(sprintf(indent + "  it('return %s', function() {\n", this.requestBody.replace(/'/g, "\\'")));
    out.write(sprintf(indent + "    var expected = %s;\n", this.responseBody));
    out.write(sprintf(indent + "    var actual = JSON.parse(mappingTemplate({template: %s, payload: %s}));\n", JSON.stringify(this.mappingTemplate), JSON.stringify(this.requestBody)));
    out.write(        indent + "    assert.deepEqual(expected, actual);\n");
    out.write(        indent + "  });\n");
    out.write(        indent + "});\n");
  }
};

function hash(input) {
  var sha1 = crypto.createHash('sha1');
  sha1.update(input);
  return sha1.digest('hex').slice(0, 8);
}