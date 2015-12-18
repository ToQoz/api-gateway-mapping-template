var clone = require('clone');
var Velocity = require('velocityjs');
var jsonpath = workaroundJsonPath(require('JSONPath'));

module.exports = function(parameters) {
  parameters = clone(parameters || {});

  var template = parameters.template;
  var payload = parameters.payload;

  var params = clone(parameters.params || {});
  params.path = params.path || {};
  params.querystring = params.querystring || {};
  params.header = params.header || {};

  var context = clone(parameters.context || {});
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
        var obj;
        // if payload starts with `{` or `[` or `"`, treat as JSON
        if (/^\s*(?:{|\[|")/.test(this._payload)) {
          obj = JSON.parse(this._payload);
        } else {
          // treat as string
          obj = this._payload;
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

  data = workaroundAwsObjectSerialization(data);

  var ast = Velocity.parse(template.toString());
  return (new Velocity.Compile(ast)).render(data);
};

// Workaround to followings
//   When the tempalte is "$input.params" (is a Function)
//     - AWS API Gateway returns "{}".
//     - This is not org.apache.velocity's behaviour. It returns "$input.params".
//   When the tempalte is "$input" or "$util"
//     - AWS API Gateway returns "{}"
//     - This is not org.apache.velocity's behaviour. It returns serialized hash.
function workaroundAwsObjectSerialization(data) {
  var returnEmptyObject = function() { return "{}"; };

  // This never be called because keySet/entrySet/size will be processed by velocity.js.
  // But I want to handling only toString
  var builtinMethod = function() { throw "unexpected error"; };
  builtinMethod.toString = returnEmptyObject;

  data.input.toString = returnEmptyObject;
  data.util.toString = returnEmptyObject;
  walk(data, function(obj) {
    if (typeof(obj) == 'function') {
      obj.toString = returnEmptyObject;
    }

    obj.keySet = builtinMethod;
    obj.entrySet = builtinMethod;
    obj.size = builtinMethod;
  });

  return data;
}

function workaroundJsonPath(jsonpath) {
  return function(obj, path) {
    if (path === '$') {
      return obj;
    }

    var result = jsonpath({
      json: obj,
      path: path
    });

    if (result.length === 1) {
      return result[0];
    } else {
      return result;
    }
  };
}

function walk(obj, cb) {
  cb(obj);

  if (Array.isArray(obj)) {
    obj.forEach(function(c) {
      walk(c, cb);
    });
  } else if ({}.toString.call(obj) === '[object Object]') {
    Object.keys(obj).forEach(function(k) {
      walk(obj[k], cb);
    });
  }
}

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
