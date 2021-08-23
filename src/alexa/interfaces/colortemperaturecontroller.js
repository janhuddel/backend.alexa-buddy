/**
 * Docs: https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-colortemperaturecontroller.html
 */
const { createHeader, notImplemented } = require("../common");
const { findDeviceById } = require("../../database");

const NAMESPACE = "Alexa.ColorTemperatureController";

const stateProperty = (value, timeOfSample, capability) => {
  if (!timeOfSample) {
    timeOfSample = new Date().toISOString();
  }

  return {
    namespace: NAMESPACE,
    name: "colorTemperatureInKelvin",
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
      supported: [{ name: "colorTemperatureInKelvin" }],
      proactivelyReported: false,
      retrievable: true,
    },
  };
};

module.exports.MapState = stateProperty;

module.exports.SetColorTemperature = async (directive, user, clientSocket) => {
  const device = await findDeviceById(directive.endpoint.endpointId);
  const capability = device.capabilities["ColorTemperatureController"];

  const value = directive.payload.colorTemperatureInKelvin;
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

module.exports.IncreaseColorTemperature = async (directive) =>
  notImplemented(directive, "IncreaseColorTemperature");

module.exports.DecreaseColorTemperature = async (directive) =>
  notImplemented(directive, "DecreaseColorTemperature");
