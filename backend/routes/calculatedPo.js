const express = require("express")
const router = express.Router();

const { generateAndSavePoAttainment } = require("../controllers/calculatedPo")

router.post("/", generateAndSavePoAttainment)

module.exports = router