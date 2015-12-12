exports.handler = function(event, context) {
  var response = "--- HEADERS ---\n";

  Object.keys(event.headers).forEach(function(k) {
    response += k + " = " + event.headers[k] + "\n";
  });

  response += "\n--- QUERYSTRINGS ---\n";

  Object.keys(event.querystring).forEach(function(k) {
    response += k + " = " + event.querystring[k] + "\n";
  });

  response += "\n--- FORM VALUES ---\n";

  Object.keys(event.form).forEach(function(k) {
    response += k + " = " + event.form[k] + "\n";
  });

  context.succeed(response);
};
