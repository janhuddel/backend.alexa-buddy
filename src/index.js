// dotenv
require("dotenv").config();

// logger
const logger = require("./util/logging");

// express webserver
const server = require("./web/webserver");

// socket.io
require("./web/websocket")(server);

// database
require("./database");

// provide a default port
const port = process.env.SERVER_PORT || 3000;

// listen to server
server.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
