var assert = require('assert');
var mappingTemplate = require('../');

describe("escape HTML", function() {
  it("DO NOT", function() {
    assert.equal(mappingTemplate({template: '$input.path("$")', payload: "<h1></h1>"}), '<h1></h1>');
    assert.equal(mappingTemplate({template: '$input.path("$")', payload: "<h1></h1>"}), '<h1></h1>');
  });
});
