var mappingTemplate = require('api-gateway-mapping-template');

var vtl = '$input.json(\'$.data\')';
var payload = '{"data": {"url": "https://github.com/ToQoz/api-gateway-mapping-template"}}';

var result = mappingTemplate({template: vtl, payload: payload});
console.dir(result);
