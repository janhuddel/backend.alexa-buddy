const express = require("express");
const router = express.Router();
const { getAccessToken, getUserProfile } = require("../util/auth-service");
const { User, findUserById } = require("../database");

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
  const tokenResponse = await getAccessToken(req.query.code);

  // load user-profile
  const profileResponse = await getUserProfile(tokenResponse.access_token);

  // lookup user
  let user = await findUserById(profileResponse.user_id);
  const currentTimestamp = new Date();
  if (!user) {
    // create new User
    user = new User({
      _id: profileResponse.user_id,
      created: currentTimestamp,
      updated: currentTimestamp,
      name: profileResponse.name,
      email: profileResponse.email,
      apikey: "",
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
    });
  } else {
    // update tokens
    user.updated = currentTimestamp;
    user.accessToken = tokenResponse.access_token;
    user.refreshToken = tokenResponse.refresh_token;
  }

  await user.save();

  // save token to session
  req.session.token = tokenResponse.access_token;

  // redirect to Vue app
  res.redirect(`http://localhost:3000`);
});
module.exports = router;
