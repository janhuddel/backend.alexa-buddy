const express = require("express");
const axios = require("axios");
const qs = require("query-string");

const { findUserById, logRequest } = require("../database");
const { getClientSocket } = require("../web/websocket");
const { errorResponse } = require("../alexa/common");
const logger = require("../util/logging");

const router = express.Router();

const authorizeAlexaRequest = async (req, res, next) => {
  const request = req.body.request;
  if (!request) {
    return res.status(400).send("no request-body found");
  }

  // retrieve user-information
  const token =
    request.directive?.payload?.scope?.token ||
    request.directive?.endpoint?.scope?.token;
  if (!token) {
    return res.status(401).send("no token found");
  }

  if (token === "test") {
    const localUser = await findUserById(process.env.TEST_USER_ID);
    req.user = localUser;
    next();
  } else {
    const params = { access_token: token };
    const uri = `https://api.amazon.com/user/profile?${qs.stringify(params)}`;

    try {
      const response = await axios.get(uri);

      if (response.status === 200) {
        // lookup user
        const localUser = await findUserById(response.data.user_id);
        if (localUser) {
          req.user = localUser;
          next();
        } else {
          return res.status(500).send();
        }
      } else {
        return res.status(403).send();
      }
    } catch (err) {
      if (err.response) {
        return res.status(err.response.status).send(err.response.data);
      } else {
        return res.status(500).send(err.message);
      }
    }
  }
};

const appendClientSocket = async (req, res, next) => {
  const clientSocket = getClientSocket(req.user._id);
  if (!clientSocket) {
    return res.status(500).send("client-socket not connected");
  }
  req.clientSocket = clientSocket;
  next();
};

const { mapInterface } = require("../alexa/interfaces");

// generic handler for all alexa-requests (called by lambda-function)
router.post(
  "/v1/alexa-request",
  authorizeAlexaRequest,
  appendClientSocket,
  async (req, res) => {
    const directive = req.body.request.directive;

    logger.info(
      `Incoming request: ${directive.header.namespace}.${directive.header.name} (user: ${req.user._id})`
    );

    try {
      const interface = mapInterface(directive.header.namespace);
      if (!interface) {
        return res.send(
          errorResponse(
            directive.header,
            "INVALID_DIRECTIVE",
            `The namespace ${directive.header.namespace} is not supported`
          )
        );
      }

      const operationName = directive.header.name;
      const operation = interface[operationName];
      if (!operation) {
        const message = `The operation ${operationName} on namespace ${namespaceName} is not supported`;
        logger.error(message);
        return res.send(
          errorResponse(directive.header, "INVALID_DIRECTIVE", message)
        );
      }

      const result = await operation(directive, req.user, req.clientSocket);

      await logRequest(directive, req.user, "ok");

      return res.send(result);
    } catch (err) {
      await logRequest(directive, req.user, "error");

      const message = `Error in handler-function: ${err.message}`;
      logger.error(message);
      return res.send(
        errorResponse(directive.header, "INTERNAL_ERROR", err.message)
      );
    }
  }
);

module.exports = router;
