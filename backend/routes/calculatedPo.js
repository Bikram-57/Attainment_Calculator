const express = require("express")
const router = express.Router();

const { generateAndSavePoAttainment, getPoAttainmentData } = require("../controllers/calculatedPo")

router.post("/", generateAndSavePoAttainment)
router.get("/", getPoAttainmentData)

module.exports = router