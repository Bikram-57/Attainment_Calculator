const express = require('express')

const {
    getSemesterAttainments,
} = require("../controllers/subjectAnalysis")

const router = express.Router();

router.get('/', getSemesterAttainments)

module.exports = router