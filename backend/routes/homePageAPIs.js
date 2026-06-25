const express = require('express')
const {
    handleGetCurrentYearSubjectForBcaMcaCount,
    handleGetPendingCopoMappingStatus,
    handleGetCurrentYearTotalSubjectsByCourse
} = require('../controllers/homePageAPIs')

const router = express.Router()

router.get('/count', handleGetCurrentYearSubjectForBcaMcaCount)
router.get('/copo-count', handleGetPendingCopoMappingStatus)
router.get('/total-subject', handleGetCurrentYearTotalSubjectsByCourse)

module.exports = router;