const http = require("http");
const express = require("express");
const cors = require("cors");
//const morgan = require("morgan");
const session = require("express-session");

// create app
const app = express();
const server = http.createServer(app);

// apply middleware
app.use(cors({ origin: true, credentials: true }));
//app.use(morgan("common"));
app.use(express.json());

// session-middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET, // don't use this secret in prod :)
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: "auto",
    httpOnly: true,
    maxAge: 3600000,
  },
});

app.use((req, res, next) => {
  // do not create session on /api/* - routes
  if (req.path.startsWith("/api/")) {
    next();
  } else {
    sessionMiddleware(req, res, next);
  }
});

// setup routes
app.use("/user", require("../routes/user"));
app.use("/login", require("../routes/login"));
app.use("/logout", require("../routes/logout"));
app.use("/oauth-callback", require("../routes/oauth-callback"));
app.use("/set-user-data", require("../routes/set-user-data"));
app.use("/api", require("../routes/api"));

module.exports = server;

module.exports.app = app;
