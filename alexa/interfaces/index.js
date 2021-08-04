const { createHeader } = require("../common");
const { findUserDevices, findDeviceById } = require("../../database");

const capabilityMap = {
  PowerController: require("./powercontroller"),
  PowerLevelController: require("./powerlevelcontroller"),
  ShutterController: require("./shuttercontroller"),
};

const toEndpoint = (device) => {
  const endpointId = device.id;

  const capabilities = Object.keys(device.capabilities).map((name) => {
    const interface = capabilityMap[name];
    return interface.Discover();
  });

  capabilities.push({
    type: "AlexaInterface",
    interface: "Alexa",
    version: process.env.PAYLOAD_VERSION,
  });

  const endpoint = {
    endpointId: endpointId,
    manufacturerName: "alexa-iobroker-bridge",
    description: device.description,
    friendlyName: device.name,
    displayCategories: [device.type],
    capabilities: capabilities,
  };

  return endpoint;
};

const defaultHandler = {
  Discover: async (directive, user) => {
    const devices = await findUserDevices(user.id);
    const endpoints = devices.map(toEndpoint);

    return {
      event: {
        header: createHeader(
          directive.header,
          "Alexa.Discovery",
          "Discover.Response"
        ),
        payload: {
          endpoints: endpoints,
        },
      },
    };
  },

  ReportState: async (directive, user, clientSocket) => {
    const device = await findDeviceById(directive.endpoint.endpointId);
    const properties = await Promise.all(
      Object.keys(device.capabilities).map(async (key) => {
        const capability = device.capabilities[key];
        const interface = capabilityMap[key];

        const state = await clientSocket.getState(capability.datapoint);
        if (state.val) {
          return interface.MapState(
            state.val,
            new Date(state.ts).toISOString(),
            capability
          );
        } else {
          const firstState = Object.values(state)[0];
          return interface.MapState(
            state,
            new Date(firstState.ts).toISOString(),
            capability
          );
        }
      })
    );

    const responseHeader = createHeader(
      directive.header,
      "Alexa",
      "StateReport"
    );

    return {
      event: {
        header: responseHeader,
        endpoint: {
          endpointId: directive.endpoint.endpointId,
        },
        payload: {},
      },
      context: {
        properties: properties,
      },
    };
  },
};

module.exports.mapInterface = (namespace) => {
  switch (namespace) {
    case "Alexa":
    case "Alexa.Discovery":
      return defaultHandler;
    case "Alexa.PowerController":
      return capabilityMap["PowerController"];
    case "Alexa.PowerLevelController":
      return capabilityMap["PowerLevelController"];
    case "Alexa.ModeController":
      // FIXME: ich benötige eine Zusatzinformation im Device (cookie?), um zu erkennen, auf was der ModeController gemapped werden soll
      return capabilityMap["ShutterController"];
  }
};
