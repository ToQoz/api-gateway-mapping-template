var assert = require('assert');
var mappingTemplate = require('../');

describe('$input', function() {
  describe('null object references', function () {
    it('render as empty string', function() {
      assert.equal(mappingTemplate({template: '$input.path("$").item1', payload: '{"item1":"hello world"}'}), 'hello world');
      assert.equal(mappingTemplate({template: '$input.path("$").item2', payload: '{"item1":"hello world"}'}), '');
    });
  });

  describe('.path(x)', function () {
    it('returns object at x(JSON Path) in payload', function() {
      assert.equal(mappingTemplate({template: '$input.path("$")', payload: "toqoz"}), 'toqoz');
      assert.equal(mappingTemplate({template: '$input.path("$")', payload: "to{qoz"}), 'to{qoz');

      assert.throws(function() { mappingTemplate({template: '$input.path("$")', payload: '{'}); }, Error);
      assert.throws(function() { mappingTemplate({template: '$input.path("$")', payload: '['}); }, Error);

      assert.equal(mappingTemplate({template: '$input.path("$.name")', payload: '{"name": "toqoz"}'}), 'toqoz');
      assert.equal(mappingTemplate({template: '$input.path("$.names")', payload: '{"names": ["toqoz", "foo", "bar"]}'}), '[toqoz, foo, bar]');
    });
  });

  describe('.json(x)', function () {
    it('returns object at x(JSON Path) in payload', function() {
      assert.equal(mappingTemplate({template: '$input.json("$.name")', payload: '{"name": "toqoz"}'}), '"toqoz"');
      assert.equal(mappingTemplate({template: '$input.json("$.names")', payload: '{"names": ["toqoz", "foo", "bar"]}'}), '["toqoz","foo","bar"]');
    });
  });

  describe('.params(x)', function () {
    var template = '$input.params("name")';

    it('searchs the value from path at first', function() {
      assert.equal(mappingTemplate({template: template, payload: "", params: {path: {name: "toqoz"}, querystring: {name: "ftoqoz"}, header: {name: "fftoqoz"}}}), 'toqoz');
    });

    it('searchs the value from querystring at second', function() {
      assert.equal(mappingTemplate({template: template, payload: "", params: {querystring: {name: "toqoz"}, header: {name: "ftoqoz"}}}), 'toqoz');
    });

    it('searchs the value from header at third', function() {
      assert.equal(mappingTemplate({template: template, payload: "", params: {header: {name: "toqoz"}}}), 'toqoz');
    });
  });

  describe('.params()', function () {
    describe('.header', function() {
      it('is header', function() {
        var template = '{"header": "$input.params().header"}';
        var result = mappingTemplate({template: template, payload: "", params: {header: {"NAME": "TOQOZ", "AGE": 999}}});
        assert.equal(result, '{"header": "{NAME=TOQOZ, AGE=999}"}');
      });

      describe('.get(x)', function() {
        it('returns header value for x', function () {
          var template = "{\"name\": \"$input.params().header.get('NAME')\"}";
          var result = mappingTemplate({template: template, payload: "", params: {header: {"NAME": "TOQOZ", "AGE": 999}}});
          assert.equal(result, '{"name": "TOQOZ"}');
        });
      });

      describe('.entrySet()', function() {
        it('returns entry(=key-value) set', function () {
          var template = "\"$input.params().header.entrySet()\"";
          var result = mappingTemplate({template: template, payload: "", params: {header: {"NAME": "TOQOZ", "AGE": 999}}});
          assert.equal(result, '"[{key=NAME, value=TOQOZ}, {key=AGE, value=999}]"');
        });
        describe('.size()', function() {
          it('returns length of receiver', function () {
            var template = "$input.params().header.entrySet().size()";
            var result = mappingTemplate({template: template, payload: "", params: {header: {"NAME": "TOQOZ", "AGE": 999}}});
            assert.equal(result, "2");
          });
        });
      });

      describe('.keySet()', function() {
        it('returns key set', function () {
          var template = "\"$input.params().header.keySet()\"";
          var result = mappingTemplate({template: template, payload: "", params: {path: {id: 12}, querystring: {}, header: {"NAME": "TOQOZ", "AGE": 999}}});
          assert.equal(result, '"[NAME, AGE]"');
        });

        describe('.size()', function() {
          it ('returns length of receiver', function() {
            var template = "$input.params().header.keySet().size()";
            var result = mappingTemplate({template: template, payload: "", params: {path: {id: 12}, querystring: {}, header: {"NAME": "TOQOZ", "AGE": 999}}});
            assert.equal(result, "2");
          });
        });
      });

      describe('.keySet() and .get(x)', function() {
        it('returns header names', function () {
          var template =
            '{' +
            '#foreach($key in $input.params().header.keySet())' +
            '"$key": "$input.params().header.get($key)"#if($foreach.hasNext), #end' +
            '#end' +
            '}';
          var header = {"NAME": "TOQOZ", "AGE": 999};
          var result = mappingTemplate({template: template, payload: "", params: {header: header}});
          assert.equal(result, '{"NAME": "TOQOZ", "AGE": "999"}');
        });
      });
    });
  });
});
