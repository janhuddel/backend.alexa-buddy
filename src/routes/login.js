const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const stateValue =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  req.session.stateValue = stateValue;

  res.redirect(
    `https://www.amazon.com/ap/oa?client_id=${
      process.env.CLIENT_ID
    }&scope=profile&response_type=code&state=${stateValue}&redirect_uri=${encodeURIComponent(
      process.env.REDIRECT_URI
    )}`
  );
});

module.exports = router;
