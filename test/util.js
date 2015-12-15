var assert = require('assert');
var mappingTemplate = require('../');

describe('$util', function() {
  describe('.escapeJavaScript()', function() {
    it ('escapes as javascript string', function() {
      var template = '$util.escapeJavaScript($input.path(\'$\'))';
      var result = mappingTemplate({template: template, payload: 'bo"dy'});
      assert.equal(result, 'bo\"dy');
    });
  });
  describe('.urlEncode()', function() {
    it ('encodes to url', function() {
      var template = '$util.urlEncode($input.path(\'$\'))';
      var actual = mappingTemplate({template: template, payload: 'エーピーアイゲートウェイ テンプレートマッピング'});
      var expected = '%E3%82%A8%E3%83%BC%E3%83%94%E3%83%BC%E3%82%A2%E3%82%A4%E3%82%B2%E3%83%BC%E3%83%88%E3%82%A6%E3%82%A7%E3%82%A4%20%E3%83%86%E3%83%B3%E3%83%97%E3%83%AC%E3%83%BC%E3%83%88%E3%83%9E%E3%83%83%E3%83%94%E3%83%B3%E3%82%B0';
      assert.equal(actual, expected);
    });
  });
  describe('.urlDecode()', function() {
    it ('decodes from url', function() {
      var template = '$util.urlDecode($input.path(\'$\'))';
      var actual = mappingTemplate({template: template, payload: '%E3%82%A8%E3%83%BC%E3%83%94%E3%83%BC%E3%82%A2%E3%82%A4%E3%82%B2%E3%83%BC%E3%83%88%E3%82%A6%E3%82%A7%E3%82%A4%20%E3%83%86%E3%83%B3%E3%83%97%E3%83%AC%E3%83%BC%E3%83%88%E3%83%9E%E3%83%83%E3%83%94%E3%83%B3%E3%82%B0'});
      var expected = 'エーピーアイゲートウェイ テンプレートマッピング';
      assert.equal(actual, expected);
    });
  });
  describe('.base64Encode()', function() {
    it ('encodes to base64', function() {
      var template = '$util.base64Encode($input.path(\'$\'))';
      var actual = mappingTemplate({template: template, payload: 'エーピーアイゲートウェイテンプレートマッピング'});
      var expected = '44Ko44O844OU44O844Ki44Kk44Ky44O844OI44Km44Kn44Kk44OG44Oz44OX44Os44O844OI44Oe44OD44OU44Oz44Kw';
      assert.equal(actual, expected);
    });
  });
  describe('.base64Decode()', function() {
    it ('decode from base64', function() {
      var template = '$util.base64Decode($input.path(\'$\'))';
      var actual = mappingTemplate({template: template, payload: '44Ko44O844OU44O844Ki44Kk44Ky44O844OI44Km44Kn44Kk44OG44Oz44OX44Os44O844OI44Oe44OD44OU44Oz44Kw'});
      var expected = 'エーピーアイゲートウェイテンプレートマッピング';
      assert.equal(actual, expected);
    });
  });
});
