const express = require("express");
const router = express.Router();
const axios = require("axios");
const qs = require("querystring");

router.get("/", (req, res) => {
  // token in session -> get user data and send it back to the vue app
  if (req.session.token) {
    axios
      .get(
        `https://api.amazon.com/user/profile?access_token=${encodeURIComponent(
          req.session.token
        )}`
      )
      .then((result) => {
        res.send({
          authState: "Authorized",
          profile: result.data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  // no token -> send nothing
  else {
    console.log("no token in session");
    res.send({
      authState: "notAuthenticated",
    });
  }
});

module.exports = router;
