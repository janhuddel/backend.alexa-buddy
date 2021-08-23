const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  // delete the session
  req.session.destroy();
  res.redirect(`http://localhost:3000`);
});

module.exports = router;
