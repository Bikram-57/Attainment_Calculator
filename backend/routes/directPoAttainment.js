const express = require("express");

const { handleGenerateDirectPoAttainment } = require("../controllers/directPoAttainment")

const router = express.Router();



router.get("/", handleGenerateDirectPoAttainment);

module.exports = router