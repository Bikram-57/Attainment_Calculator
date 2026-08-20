const express = require('express')
const verifyRoles = require('../middleware/verifyRoles');
const {
    getSemesterAttainments,
} = require("../controllers/subjectAnalysis")

const router = express.Router();

router.get('/', verifyRoles('admin'), getSemesterAttainments)

module.exports = router