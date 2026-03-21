const express = require('express');
const router = express.Router();
const { saveCoPoRelation } = require('../controllers/coPoMapping');
const { getCoPoRelation } = require('../controllers/coPoMapping');

// GET /api/copo/relation?subjectId=CA2313&academicYear=2025-26&course=BCA
router.get('/relation', getCoPoRelation);


// This matches the <form action="/api/copo/save-relation" method="POST">
router.post('/save-relation', saveCoPoRelation);

module.exports = router;