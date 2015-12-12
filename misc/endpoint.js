var AWS = require('aws-sdk');
var lambda = new AWS.Lambda();
var apiGateway = new AWS.APIGateway();

var Promise = require('bluebird');
Promise.promisifyAll(Object.getPrototypeOf(apiGateway));

module.exports = Endpoint;

function Endpoint(params) {
  this.region = params.region;
  this.accountId = params.accountId;

  this.apiName = params.apiName;
  this.restApiId = null;
  this.resourceId = null;
  this.lambdaRole = params.lambdaRole;
  this.functionName = params.functionName;
  this.functionZip = params.functionZip;
  this.functionArn = null;
  this.httpMethod = "POST";

  this._defer = [];

  this.promise = Promise.resolve();
}

Endpoint.prototype.defer = function(cb) {
  this._defer = this._defer || [];
  this._defer.push(cb);
};

Endpoint.prototype.cleanup = function() {
  console.log("cleanup...");
  while(true) {
    if (!this._defer || this._defer <= 0) break;
    this._defer.pop()();
  }
};

Endpoint.prototype.then = function (onFulfilled, onRejected) {
  this.promise = this.promise.then(onFulfilled, onRejected);
  return this;
};

Endpoint.prototype["catch"] = function (onRejected) {
  this.promise = this.promise.catch(onRejected);
  return this;
};

Endpoint.prototype.createFunction = function() {
  var that = this;

  return this.then(function() {
    console.log("create function");

    return new Promise(function(resolve, reject) {
      lambda.createFunction(
        {
          FunctionName: that.functionName,
          Runtime: "nodejs",
          Role: that.lambdaRole,
          Handler: 'index.handler',
          Timeout: 6,
          MemorySize: 128,
          Code: {
            ZipFile: that.functionZip.toBuffer()
          }
        },
        function(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    })
      .then(function(data) {
        that.functionArn = data.FunctionArn;
        that.defer(function() {
          console.log("delete lambda functionName=" + that.functionName);
          lambda.deleteFunction({FunctionName: that.functionName}, function(err) { if (err) console.log(err); });
        });
      });
  });
};

Endpoint.prototype.createRestApi = function() {
  var that = this;

  return this.then(function() {
    console.log("create rest api");
    return apiGateway.createRestApiAsync({name: that.apiName})
      .then(function(data) {
        that.restApiId = data.id;
        that.url = "https://" + that.restApiId + ".execute-api." + that.region + ".amazonaws.com/dev";

        that.defer(function() {
          console.log("delete api restApiId=" + that.restApiId);
          apiGateway.deleteRestApiAsync({restApiId: that.restApiId});
        });

        console.log("get resources");
        return apiGateway.getResourcesAsync({restApiId: that.restApiId})
          .then(function(data) {
            var rootResourceId = data.items[0].id;
            that.resourceId = rootResourceId;
          });
      });
  });
};

Endpoint.prototype.putMethod = function() {
  var that = this;

  return this.then(function() {
    console.log("add put method");
    return apiGateway.putMethodAsync({
      restApiId: that.restApiId,
      resourceId: that.resourceId,
      httpMethod: that.httpMethod,
      authorizationType: 'None',
      apiKeyRequired: false,
      requestParameters: {}
    });
  });
};

Endpoint.prototype.putIntegration = function(requestTemplates) {
  var that = this;

  return this.then(function() {
    console.log("add put integration");

    return apiGateway.putIntegrationAsync({
      restApiId: that.restApiId,
      resourceId:  that.resourceId,
      httpMethod: that.httpMethod,
      integrationHttpMethod: "POST",
      type: "AWS",
      requestTemplates: requestTemplates,
      uri: "arn:aws:apigateway:" + that.region + ":lambda:path/2015-03-31/functions/" + that.functionArn + "/invocations"
    });
  });
};

Endpoint.prototype.putMethodResponse = function(responseModels) {
  var that = this;

  return this.then(function() {
    console.log("add put integration response");

    return Promise.all([200, 400].map(function(code) {
      return apiGateway.putMethodResponseAsync({
        restApiId: that.restApiId,
        resourceId:  that.resourceId,
        httpMethod: "POST",
        statusCode: code.toString(),
        responseModels: responseModels
      });
    }));
  });
};

Endpoint.prototype.putIntegrationResponse = function(responseTemplates) {
  var that = this;

  return this.then(function() {
    console.log("add put integration response");
    return apiGateway.putIntegrationResponseAsync({
      restApiId: that.restApiId,
      resourceId:  that.resourceId,
      httpMethod: "POST",
      statusCode: "200",
      responseTemplates: responseTemplates
    });
  });
};

Endpoint.prototype.addPermission = function() {
  var that = this;

  return this.then(function() {
    console.log("add permission");
    return new Promise(function(resolve, reject) {
      lambda.addPermission(
        {
          FunctionName: that.functionName,
          StatementId: "sid-agmt-" + (Date.now()),
          Action: "lambda:InvokeFunction",
          Principal: "apigateway.amazonaws.com",
          SourceArn: "arn:aws:execute-api:ap-northeast-1:" + that.accountId + ":" + that.restApiId + "/*/POST/",
        },
        function(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    });
  });
};

Endpoint.prototype.deploy = function() {
  var that = this;

  return this.then(function() {
    console.log("deploy endpoint");
    return apiGateway.createDeploymentAsync({
      restApiId: that.restApiId,
      stageName: "dev"
    });
  });
};
