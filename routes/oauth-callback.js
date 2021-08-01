const express = require("express");
const router = express.Router();
const axios = require("axios").default;
const qs = require("query-string");

const config = {
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
};
const url = `https://api.amazon.com/auth/o2/token`;

router.get("/", async (req, res) => {
  // State from Server
  const stateFromServer = req.query.state;
  if (stateFromServer !== req.session.stateValue) {
    console.log("State doesn't match. uh-oh.");
    console.log(
      `Saw: ${stateFromServer}, but expected: ${req.session.stateValue}`
    );
    res.redirect(302, "/");
    return;
  }

  // aquire token from token-endpoint
  const response = await axios.post(
    "https://api.amazon.com/auth/o2/token",
    qs.stringify({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: req.query.code,
      grant_type: "authorization_code",
      redirect_uri: process.env.REDIRECT_URI,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  // save token to session
  req.session.token = response.data.access_token;

  // redirect to Vue app
  res.redirect(`http://localhost:3000`);
});
module.exports = router;
