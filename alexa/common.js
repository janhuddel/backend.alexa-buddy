module.exports.createHeader = (directiveHeader, namespace, name) => {
  const header = {
    namespace: namespace,
    name: name,
    messageId: directiveHeader.messageId,
    payloadVersion: "3",
  };

  if (directiveHeader.correlationToken) {
    header.correlationToken = directiveHeader.correlationToken;
  }

  return header;
};

module.exports.errorResponse = (directiveHeader, type, message, endpointId) => {
  const event = {};

  event.header = this.createHeader(directiveHeader, "Alexa", "ErrorResponse");

  if (endpointId) {
    event.endpoint = { endpointId: endpointId };
  }

  event.payload = {
    type: type,
    message: message,
  };

  return {
    event: event,
  };
};

module.exports.notImplemented = (directive, operationName) =>
  errorResponse(
    directive.header,
    "INVALID_DIRECTIVE",
    `${operationName} is not implemented yet`,
    directive.endpoint.endpointId
  );

module.exports.deviceInOperation = (directive) =>
  this.errorResponse(
    directive.header,
    "ALREADY_IN_OPERATION",
    `Device is already in operation`,
    directive.endpoint.endpointId
  );
