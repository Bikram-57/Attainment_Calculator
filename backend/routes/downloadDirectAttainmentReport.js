const express = require("express");
const verifyRoles = require('../middleware/verifyRoles');
const {
  handleDownloadDirectPoReport,
  handleDownloadDirectPoReportPDF
} = require("../controllers/downloadDirectAttainmentReport");

const router = express.Router();

router.post("/direct-po", verifyRoles('admin'), handleDownloadDirectPoReport);
router.post("/direct-po-pdf", verifyRoles('admin'), handleDownloadDirectPoReportPDF);


module.exports = router;

