const express = require('express')
const {
    handleGetCurrentYearSubjectForBcaMcaCount,
    handleGetPendingCopoMappingStatus,
    handleGetCurrentYearTotalSubjectsByCourse,
    handleGetProgressOfMCA,
    handleGetProgressOfBCA,
    handleGetProgressOfCoPoMappingForMCA,
    handleGetProgressOfCoPoMappingForBCA,
} = require('../controllers/homePageAPIs')

const router = express.Router()

router.get('/count', handleGetCurrentYearSubjectForBcaMcaCount)
router.get('/copo-count', handleGetPendingCopoMappingStatus)
router.get('/total-subject', handleGetCurrentYearTotalSubjectsByCourse)
router.get('/progress-MCA', handleGetProgressOfMCA)
router.get('/progress-BCA', handleGetProgressOfBCA)
router.get('/mapping-progress-MCA', handleGetProgressOfCoPoMappingForMCA)
router.get('/mapping-progress-BCA', handleGetProgressOfCoPoMappingForBCA)

module.exports = router;

// must add route security through jwt