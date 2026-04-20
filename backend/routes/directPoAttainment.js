const express = require("express");

const { 
    handleGenerateDirectPoAttainment,
    // fetchCoGrandTotals
    getDirectPoAttainment
 } = require("../controllers/directPoAttainment")

const router = express.Router();



router.post("/", handleGenerateDirectPoAttainment);
router.get("/", getDirectPoAttainment);
// router.get("/", fetchCoGrandTotals);

module.exports = router