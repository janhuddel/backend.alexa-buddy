const express = require("express");
const jwt = require("njwt");

const { getAccessToken, getUserProfile } = require("../util/auth-service");
const { User, findUserById } = require("../database");

const router = express.Router();

/**
 * Redirect to Amazon-Login-Page.
 */
router.get("/login", async (req, res) => {
  res.redirect(
    `https://www.amazon.com/ap/oa?client_id=${
      process.env.CLIENT_ID
    }&scope=profile&response_type=code&state=${
      req.query.intent
    }&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}`
  );
});

/**
 * Process OAuth-Callback
 */
router.get("/callback", async (req, res) => {
  const intent = req.query.state;

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

  const claims = { iss: "fun-with-jwts", sub: user._id };
  const token = jwt.create(claims, process.env.JWT_SIGNING_KEY);
  token.setExpiration(new Date().getTime() + 24 * 60 * 60 * 1000); // 1 day

  // store jwt-token in httpOnly-Cookie
  res
    .cookie("jwt", token.compact(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
    .redirect(`http://localhost:3000${intent}`);
});

module.exports = router;
