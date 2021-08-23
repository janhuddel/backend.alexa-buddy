/**
 * Docs: https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-colorcontroller.html
 */
const { createHeader, notImplemented } = require("../common");
const { findDeviceById } = require("../../database");

// Color-Conversion
const Color = require("color");
const hueconv = require("@q42philips/hue-color-converter");

const NAMESPACE = "Alexa.ColorController";

const convertToXy = (color) => {
  const rgb = Color.hsv(
    parseFloat(color.hue),
    parseFloat(color.saturation) * 100,
    parseFloat(color.brightness) * 100
  ).rgb();

  const xy = hueconv.calculateXY(rgb.red(), rgb.green(), rgb.blue());
  return `${xy[0]},${xy[1]}`;
};

const stateProperty = (value, timeOfSample, capability) => {
  if (!timeOfSample) {
    timeOfSample = new Date().toISOString();
  }

  // FIXME: StateReporting derzeit mit fixem Wert, da ich xy nicht nach HSB umrechnen kann
  return {
    namespace: NAMESPACE,
    name: "color",
    value: {
      hue: 350.5,
      saturation: 0.7138,
      brightness: 0.6524,
    },
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
      supported: [{ name: "color" }],
      proactivelyReported: false,
      retrievable: true,
    },
  };
};

module.exports.MapState = stateProperty;

module.exports.SetColor = async (directive, user, clientSocket) => {
  const device = await findDeviceById(directive.endpoint.endpointId);
  const capability = device.capabilities["ColorController"];

  const value = convertToXy(directive.payload.color);
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
      properties: [stateProperty()],
    },
  };
};
