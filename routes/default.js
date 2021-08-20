const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  res.status(200).send("<h1>alexa-buddy-backend is up & running</h1>");
});

module.exports = router;
