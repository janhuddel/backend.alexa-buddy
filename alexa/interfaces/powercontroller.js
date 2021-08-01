/**
 * Docs: https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-powercontroller.html
 */
const { createHeader } = require("../common");
const { findDeviceById } = require("../../database");

const NAMESPACE = "Alexa.PowerController";

const stateProperty = (value, timeOfSample, capability) => {
  if (!timeOfSample) {
    timeOfSample = new Date().toISOString();
  }

  return {
    namespace: NAMESPACE,
    name: "powerState",
    value: value ? "ON" : "OFF",
    timeOfSample: timeOfSample,
    uncertaintyInMilliseconds: 0,
  };
};

const setPowerState = async (directive, user, clientSocket, value) => {
  const device = await findDeviceById(directive.endpoint.endpointId);
  const capability = device.capabilities["PowerController"];

  await clientSocket.setState({
    [capability.datapoint]: value,
  });

  const responseHeader = createHeader(directive.header, "Alexa", "Response");

  return {
    event: {
      header: responseHeader,
      endpoint: {
        endpointId: directive.endpoint.endpointId,
      },
      payload: {},
    },
    context: {
      properties: [stateProperty(value)],
    },
  };
};

module.exports.Discover = () => {
  return {
    type: "AlexaInterface",
    interface: NAMESPACE,
    version: process.env.PAYLOAD_VERSION,
    properties: {
      supported: [{ name: "powerState" }],
      proactivelyReported: false,
      retrievable: true,
    },
  };
};

module.exports.MapState = stateProperty;

module.exports.TurnOn = async (directive, user, clientSocket) =>
  await setPowerState(directive, user, clientSocket, true);

module.exports.TurnOff = async (directive, user, clientSocket) =>
  await setPowerState(directive, user, clientSocket, false);
