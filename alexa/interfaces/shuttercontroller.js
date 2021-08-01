/**
 * Docs: https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-modecontroller.html
 */
const {
  createHeader,
  notImplemented,
  deviceInOperation,
} = require("../common");
const { findDeviceById } = require("../../database");

const NAMESPACE = "Alexa.ModeController";
const INSTANCE = "Blinds.Position";

const positionModes = {
  up: {
    value: "Position.Up",
    modeResources: {
      friendlyNames: [
        {
          "@type": "asset",
          value: {
            assetId: "Alexa.Value.Open",
          },
        },
      ],
    },
  },
  down: {
    value: "Position.Down",
    modeResources: {
      friendlyNames: [
        {
          "@type": "asset",
          value: {
            assetId: "Alexa.Value.Close",
          },
        },
      ],
    },
  },
};

const stateProperty = (value, timeOfSample, capability) => {
  if (!timeOfSample) {
    timeOfSample = new Date().toISOString();
  }

  let rawValue;
  if (capability?.statemapping) {
    for (const [k, v] of Object.entries(capability.statemapping)) {
      if (v === value) {
        rawValue = k;
        break;
      }

      // FIXME: Report Error (unknown value)
    }
  } else {
    rawValue = value === 0 ? "Position.Down" : "Position.Up";
  }

  return {
    namespace: NAMESPACE,
    instance: INSTANCE,
    name: "mode",
    value: rawValue,
    timeOfSample: timeOfSample,
    uncertaintyInMilliseconds: 0,
  };
};

module.exports.Discover = () => {
  return {
    type: "AlexaInterface",
    interface: NAMESPACE,
    instance: INSTANCE,
    version: process.env.PAYLOAD_VERSION,
    properties: {
      supported: [{ name: "mode" }],
      proactivelyReported: false,
      retrievable: true,
    },
    capabilityResources: {
      friendlyNames: [
        {
          "@type": "asset",
          value: {
            assetId: "Alexa.Setting.Opening",
          },
        },
      ],
    },
    configuration: {
      ordered: false,
      supportedModes: [positionModes["up"], positionModes["down"]],
    },
    semantics: {
      actionMappings: [
        {
          "@type": "ActionsToDirective",
          actions: ["Alexa.Actions.Close", "Alexa.Actions.Lower"],
          directive: {
            name: "SetMode",
            payload: {
              mode: "Position.Down",
            },
          },
        },
        {
          "@type": "ActionsToDirective",
          actions: ["Alexa.Actions.Open", "Alexa.Actions.Raise"],
          directive: {
            name: "SetMode",
            payload: {
              mode: "Position.Up",
            },
          },
        },
      ],
      stateMappings: [
        {
          "@type": "StatesToValue",
          states: ["Alexa.States.Closed"],
          value: "Position.Down",
        },
        {
          "@type": "StatesToValue",
          states: ["Alexa.States.Open"],
          value: "Position.Up",
        },
      ],
    },
  };
};

module.exports.MapState = stateProperty;

module.exports.SetMode = async (directive, user, clientSocket) => {
  const device = await findDeviceById(directive.endpoint.endpointId);
  const capability = device.capabilities["ShutterController"];

  /*
  if (capability.busy) {
    const busyVal = await clientSocket.getState(capability.busy.datapoint);
    // TODO: resolve busy.expression
    if (busyVal.val) {
      return deviceInOperation(directive);
    }
  }
  */

  let value;
  if (capability.statemapping) {
    value = capability.statemapping[directive.payload.mode];
  } else {
    value = directive.payload.mode === "Position.Down" ? 0 : 100;
  }

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
      properties: [stateProperty(directive.payload.mode)],
    },
  };
};

module.exports.AdjustPowerLevel = async (directive) =>
  notImplemented(directive, "AdjustPowerLevel");
