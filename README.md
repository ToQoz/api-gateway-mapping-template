# api-gateway-mapping-template

make AWS API Gateway's Mapping Template testable

![Image](http://toqoz.net/art/api-gateway-mapping-template.png)

## Installation

```
npm install api-gateway-mapping-template
```

## Usage

simple.js:

```node
var mappingTemplate = require('api-gateway-mapping-template')

var vtl = '$input.json(\'$.data\')';
var payload = '{"data": {"url": "https://github.com/ToQoz/api-gateway-mapping-template"}}';

var result = mappingTemplate(vtl, payload)
console.dir(result);
```

***

```
$ node ./simple.js
'{"url":"https://github.com/ToQoz/api-gateway-mapping-template"}'
```

## Examples

- [./examples/express](/examples/express) - example with express in order to test API Gateway + Lambda in your local.
- [online checker](https://github.com/ToQoz/mapping-template-checker.toqoz.net) - http://mapping-template-checker.toqoz.net

## API

```node
var mappingTemplate = require('api-gateway-mapping-template')
```

### mappingTemplate(template, payload, params, context)

This function renders AWS API Gateway's Mapping Template by using given payload, params and context.

- Arguments
  - template - **required** - `String|Buffer`
  - payload - **required** - `String|Buffer`
  - params - `map`
    - path - `map<String, String|Number|Boolean|null>`
    - querystring - `map<String, String|Number|Boolean|null>`
    - header - `map<String, String|Number|Boolean|null>`
  - context - `map`
    - indentity - `map<String, String>`
      - cognitoAuthenticationType - `String`
      - cognitoIdentityId - `String`
      - cognitoIdentityPoolId - `String`
      - sourceIp - `String`
      - user - `String`
      - userAgent - `String`
      - userArn - `String`
    - requestId - `String`
    - resourceId - `String`
    - resourcePath -  `String`
    - stage -  `String`
- Return value
  - rendered template -  `String`
