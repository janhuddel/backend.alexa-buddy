const express = require("express");
const router = express.Router();
const { getUserProfile } = require("../util/auth-service");

router.get("/", async (req, res) => {
  if (req.session.token) {
    // token in session -> get user data and send it back to the vue app
    const response = await getUserProfile(req.session.token);
    res.send({
      authState: "Authorized",
      profile: response,
    });
  } else {
    // no token -> send 403
    console.log("no token in session");
    res.status(403).send();
  }
});

module.exports = router;
