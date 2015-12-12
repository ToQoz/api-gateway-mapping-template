var clone = require('clone');
var Velocity = require('velocityjs');
var _jsonpath = require('JSONPath');
var jsonpath = function(obj, path) {
  if (path === '$') {
    return obj;
  }

  var result = _jsonpath({
    json: obj,
    path: path
  });

  if (result.length === 1) {
    return result[0];
  } else {
    return result;
  }
};

module.exports = function(template, payload, params, context) {
  params = clone(params || {});
  params.path = params.path || {};
  params.querystring = params.querystring || {};
  params.header = params.header || {};

  context = clone(context || {});
  context.identity = context.identity || {};

  // API Gateway Mapping Template Reference
  //   http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html
  var data = {
    context: context,
    input: {
      _payload: payload.toString(),
      path: function(path) {
        var obj;
        // if payload starts with `{` or `[` or `"`, treat as JSON
        if (/^\s*(?:{|\[|")/.test(this._payload)) {
          obj = JSON.parse(this._payload);
        } else {
          // treat as string
          obj = this._payload;
        }

        return jsonpath(obj, path);
      },
      json: function(path) {
        var obj = JSON.parse(payload);
        if (typeof obj === 'string') {
          // re-parse when parsed payload is string.
          // because of
          //   - https://github.com/ToQoz/api-gateway-mapping-template/blob/master/test/_.md#example-0ce08526
          //   - https://github.com/ToQoz/api-gateway-mapping-template/blob/master/test/_.md#example-1b8d22cd
          obj = JSON.parse(obj);
        }

        return JSON.stringify(jsonpath(obj, path));
      },
      params: function(x) {
        switch (true) {
        case x === undefined:
          return params;
        case x in params.path:
          return params.path[x];
        case x in params.querystring:
          return params.querystring[x];
        case x in params.header:
          return params.header[x];
        }
      },
    },
    util: {
      escapeJavaScript: escapeJavaScript,
      urlEncode: encodeURIComponent,
      urlDecode: decodeURIComponent,
      base64Encode: base64Encode,
      base64Decode: base64Decode,
    }
  };

  // API Gateway convert function to "{}" on toString.
  var returnEmptyObject = function() { return "{}"; };
  [
    data.input,
    data.input.params,
    data.input.path,
    data.input.json,
    data.util,
    data.util.escapeJavaScript,
    data.util.urlEncode,
    data.util.urlDecode,
    data.util.base64Encode,
    data.util.base64Decode,
  ].forEach(function(f) {
    f.toString = returnEmptyObject;
  });

  var ast = Velocity.parse(template.toString());
  return (new Velocity.Compile(ast)).render(data);
};

function base64Encode(x) {
  return (new Buffer(x)).toString('base64');
}

function base64Decode(x) {
  return (new Buffer(x, 'base64')).toString();
}

// I recognize $util.escapeJavaScript as almost `escapeJSONString` and implemented so.
// c.f. 24.3.2.2 Runtime Semantics: QuoteJSONString ( value )
//   http://www.ecma-international.org/ecma-262/6.0/index.html#sec-quotejsonstring
//   DO: 2.a -> 2.b -> 2.c -> 2.d
var escapeJavaScriptTable = {
  '"': '\"',    // 2.a
  '\\': '\\\\',
  '\b': '\\b',  // 2.b (skip abbrev)
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
};
// 2.c
for (var code = 0; code < 20; code++) {
  escapeJavaScriptTable[String.fromCharCode(code)] = ((code < 16) ? '\\u000' : '\\u00') + code.toString(16);
}
function escapeJavaScript(x) {
  return x.split("").map(function(c) {
    // 2.a - 2.c
    if (c in escapeJavaScriptTable) {
      return escapeJavaScriptTable[c];
    }

    // 2.d
    return c;
  }).join("");
}
