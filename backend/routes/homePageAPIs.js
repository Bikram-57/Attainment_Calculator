const express = require('express')
const {handleGetCurrentYearSubjectForBcaMcaCount} = require('../controllers/homePageAPIs')

const router = express.Router()

router.get('/count', handleGetCurrentYearSubjectForBcaMcaCount)

module.exports = router;