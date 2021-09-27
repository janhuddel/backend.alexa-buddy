const http = require("http");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// create app
const app = express();
const server = http.createServer(app);

// apply middleware
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());

// oauth
app.use("/oauth", require("../routes/oauth"));

// api for webapp
app.use("/api", require("../routes/api"));

// alexa-request-handler
app.use("/alexa", require("../routes/alexa"));

module.exports = server;

module.exports.app = app;
