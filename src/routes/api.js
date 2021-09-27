const express = require("express");
const jwt = require("njwt");

const { findUserById } = require("../database");
const { getUserProfile } = require("../util/auth-service");

const router = express.Router();

/**
 * Middleware for checking JWT and load user from database.
 */
router.use(async (req, res, next) => {
  try {
    if (!req.cookies.jwt) {
      return res.status(401).send();
    }

    // verify jwt from cookie - FIXME: check jwt in middleware
    const verifiedJwt = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SIGNING_KEY
    );

    // load user-detail incl. access_token from database
    const userId = verifiedJwt.body.sub;
    req.user = await findUserById(userId);

    next();
  } catch (e) {
    logger.error(`verification of jwt failed: ${e.message}`);
    res.status(401).send();
  }
});

router.get("/profile", async (req, res) => {
  try {
    // get user-details from oauth-service
    const response = await getUserProfile(req.user.accessToken);
    res.send({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      apikey: req.user.apikey,
    });
  } catch (e) {
    logger.error(`verification of jwt failed: ${e.message}`);
    res.status(401).send();
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("jwt").redirect(`http://localhost:3000/`);
});

module.exports = router;
