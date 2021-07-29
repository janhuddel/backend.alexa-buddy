/**
 * Docs: https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-powerlevelcontroller.html
 */
const { createHeader, notImplemented } = require("../common");
const { findDeviceById } = require("../../database");

const NAMESPACE = "Alexa.PowerLevelController";

const stateProperty = (value, timeOfSample, capability) => {
  if (!timeOfSample) {
    timeOfSample = new Date().toISOString();
  }

  return {
    namespace: NAMESPACE,
    name: "powerLevel",
    value: value,
    timeOfSample: timeOfSample,
    uncertaintyInMilliseconds: 0,
  };
};

module.exports.Discover = () => {
  return {
    type: "AlexaInterface",
    interface: NAMESPACE,
    version: process.env.PAYLOAD_VERSION,
    properties: {
      supported: [{ name: "powerLevel" }],
      proactivelyReported: false,
      retrievable: true,
    },
  };
};

module.exports.MapState = stateProperty;

module.exports.SetPowerLevel = async (directive, user, clientSocket) => {
  const device = await findDeviceById(directive.endpoint.endpointId);
  const capability = device.capabilities["PowerLevelController"];

  const value = directive.payload.powerLevel;

  const currentValue = await clientSocket.setState(capability.datapoint, value);

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
      properties: [stateProperty(currentValue)],
    },
  };
};

module.exports.AdjustPowerLevel = async (directive) =>
  notImplemented(directive, "AdjustPowerLevel");
