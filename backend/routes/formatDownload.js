const express = require("express");
const router = express.Router();
const verifyRoles = require('../middleware/verifyRoles');
const {
  handleFormatDownload,
  handleUploadAssignSubjectDownload,
  handleCoPoMappingFormatDownload,
  handleUploadAllSubjectFormatDownload,
  handleUploadRubricsFormatDownload,
  handleInternalMarksFormatDownload,
  handleExternalMarksFormatDownload,
} = require("../controllers/formatDownload");

// Create a simple GET route that doesn't need any parameters
router.get("/", verifyRoles('admin', 'faculty'), handleFormatDownload);
router.get("/assign-sub", verifyRoles('admin'), handleUploadAssignSubjectDownload);
router.get("/copo-mapping", verifyRoles('admin', 'faculty'), handleCoPoMappingFormatDownload);
router.get("/subject", verifyRoles('admin'), handleUploadAllSubjectFormatDownload);
router.get("/rubrics", verifyRoles('admin'), handleUploadRubricsFormatDownload);
router.get("/internal",  verifyRoles('admin', 'faculty'), handleInternalMarksFormatDownload);
router.get("/external", verifyRoles('admin', 'faculty'), handleExternalMarksFormatDownload);

module.exports = router;
