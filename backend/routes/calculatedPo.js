const express =  require("express")
const router = express.Router()

const { calculateAndSavePOAttainment } = require("../controllers/calculatedPo")

router.post("/", calculateAndSavePOAttainment);

module.exports = router;
