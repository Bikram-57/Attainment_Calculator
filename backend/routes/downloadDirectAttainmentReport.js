const express = require("express");
const verifyRoles = require('../middleware/verifyRoles');
const {
  downloadDirectPoReport,
} = require("../controllers/downloadDirectAttainmentReport");

const router = express.Router();

router.post("/direct-po", verifyRoles('admin'), downloadDirectPoReport);
// router.get('/direct-po', downloadDirectPoReport);

module.exports = router;

