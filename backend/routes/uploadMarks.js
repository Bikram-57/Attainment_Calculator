// routes/excelRoutes.js
const express = require("express");
const upload = require("../middleware/uploadMarks");
const { handleExcelUpload } = require("../controllers/uploadMarks");

const router = express.Router();

// upload excel file
router.post("/", upload.single("excel"), handleExcelUpload);

module.exports = router;
