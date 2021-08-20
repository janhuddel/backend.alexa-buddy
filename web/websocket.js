const { Server } = require("socket.io");
const { findUserByApiKey } = require("../database");
const logger = require("../util/logging");

let io = null;

// object to store connected clients
const clients = {};

const authenticate = async (socket, next) => {
  const apikey = socket.handshake?.query?.apikey;
  if (apikey) {
    const user = await findUserByApiKey(apikey);
    if (user) {
      clients[user.id] = socket.id;
      socket.user = user;
      return next();
    }
  }

  logger.error(
    "Invalid apikey: %s (client ip: %s)",
    apikey,
    socket.conn.remoteAddress
  );

  // disconnect
  socket.disconnect("Authentication error");
};

const newConnection = (socket) => {
  const user = socket.user;

  logger.info("New user connected: %s", user.name);

  socket.on("disconnect", () => {
    delete clients[user.id];
    logger.info("User disconnected: %s", user.name);
  });
};

module.exports = (server) => {
  io = new Server(server);

  // middleware to authenticate websocket-requests
  io.use(authenticate);

  // handle new connections
  io.on("connection", newConnection);

  return io;
};

module.exports.getClientSocket = (userId) => {
  const clientSocket = io.sockets.sockets.get(clients[userId]);

  const sendMessage = (event, message) => {
    logger.debug(
      "sending event %s to server (message = %s)",
      event,
      JSON.stringify(message)
    );

    return new Promise((resolve) => {
      clientSocket.emit(event, message, (response) => {
        logger.debug("resonse for event: %s", JSON.stringify(response));
        resolve(response);
      });
    });
  };

  return {
    getState: async (datapoint) => await sendMessage("getState", datapoint),

    setState: async (states) => {
      return await sendMessage("setState", states);
    },
  };
};
