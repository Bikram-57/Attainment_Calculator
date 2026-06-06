const express = require("express");

const router = express.Router();
const {handleDownloadReport} = require("../controllers/downloadReport")

router.get('/download', handleDownloadReport);

module.exports = router;
