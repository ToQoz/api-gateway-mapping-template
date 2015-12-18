var PRODUCT_NAME="api-gateway-mapping-template-integration-test";

if (!process.env.AWS_ACCOUNT_ID) {
  throw "process.env.AWS_ACCOUNT_ID is required";
}

process.env.AWS_REGION     = process.env.AWS_REGION     || "ap-northeast-1";
process.env.AWS_PROFILE    = process.env.AWS_PROFILE    || PRODUCT_NAME;
process.env.LAMBDA_ROLE    = process.env.LAMBDA_ROLE    || "arn:aws:iam::" + process.env.AWS_ACCOUNT_ID + ":role/" + PRODUCT_NAME;

var Promise = require('bluebird');
var Zip = require('adm-zip');

var Endpoint = require('./endpoint');
var postExamples = require('./post_examples');
var writeResults = require('./result');


var zip = new Zip();
zip.addFile('index.js', new Buffer("exports.handler = function(event, context) { context.succeed(JSON.stringify(event)); };"));

var examples = require('./examples');
var requestTemplates  = examples.reduce(function(product, e, i) { product["text/test-" + i] = e.template; return product; }, {});
var responseModels    = examples.reduce(function(product, e, i) { product["text/test-" + i] = "Empty"; return product; }, {});
var responseTemplates = examples.reduce(function(product, e, i) { product["text/test-" + i] = "$input.path('$')"; return product; }, {});

var endpoint = new Endpoint({
  region: process.env.AWS_REGION,
  accountId: process.env.AWS_ACCOUNT_ID,
  apiName: PRODUCT_NAME,
  lambdaRole: process.env.LAMBDA_ROLE,
  functionName: PRODUCT_NAME + "-console-log",
  functionZip: zip
});

endpoint
  .createFunction()
  .createRestApi()
  .putMethod()
  .putIntegration(requestTemplates)
  .putMethodResponse(responseModels)
  .putIntegrationResponse(responseTemplates)
  .addPermissionInvokeFunction()
  .deploy()
  .then(function() {
    console.log(endpoint.endpoint_url);
    return postExamples(endpoint.endpoint_url, examples);
  })
  .then(writeResults)
  .then(function() {
    endpoint.cleanup();
  })
  .catch(function(err) {
    console.error(err);
    err.stack.split('\n').forEach(function(t) { console.error(t); });
    endpoint.cleanup();
  });
