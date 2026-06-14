const express = require("express")
const router = express.Router();

const verifyRoles = require('../middleware/verifyRoles');

const { generateAndSavePoAttainment, getPoAttainmentData } = require("../controllers/calculatedPo")

router.post("/", verifyRoles('admin', 'faculty'), generateAndSavePoAttainment)
router.get("/", verifyRoles('admin', 'faculty'), getPoAttainmentData)

module.exports = router