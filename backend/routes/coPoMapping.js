const express = require('express');
const router = express.Router();

const verifyRoles = require('../middleware/verifyRoles');

const { 
    saveCoPoRelation,
    getCoPoRelation,
    handleGetMyFilteredSubjects,
    getCoPoRelationByYear,
} = require('../controllers/coPoMapping');

// GET /api/copo/relation?subjectId=CA2313&academicYear=2025-26&course=BCA
router.get('/relation', verifyRoles('admin', 'faculty'), getCoPoRelation);


router.get('/relation-yearwise', verifyRoles('admin', 'faculty'), getCoPoRelationByYear);

// POST request to save the mapping
router.post('/save-relation', verifyRoles('admin', 'faculty'), saveCoPoRelation);

// GET request to fetch the user's assigned subjects (FIXED THIS LINE)
router.get('/filter', verifyRoles('admin', 'faculty'), handleGetMyFilteredSubjects);

module.exports = router;