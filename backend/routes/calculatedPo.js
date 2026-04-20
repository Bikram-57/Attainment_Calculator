const express = require("express")
const router = express.Router();

const { generateAndSavePoAttainment } = require("../controllers/calculatedPo")

router.get("/", generateAndSavePoAttainment)

module.exports = router