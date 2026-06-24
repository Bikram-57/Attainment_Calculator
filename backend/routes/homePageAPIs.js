const express = require('express')
const {handleGetCurrentYearSubjectForBcaMcaCount, handleGetPendingCopoMappingStatus} = require('../controllers/homePageAPIs')

const router = express.Router()

router.get('/count', handleGetCurrentYearSubjectForBcaMcaCount)
router.get('/copo-count', handleGetPendingCopoMappingStatus)

module.exports = router;