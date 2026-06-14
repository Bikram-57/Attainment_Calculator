const express = require('express');
const router = express.Router();

const verifyRoles = require('../middleware/verifyRoles');


const { saveCoPoRelation } = require('../controllers/coPoMapping');
const { getCoPoRelation } = require('../controllers/coPoMapping');

// GET /api/copo/relation?subjectId=CA2313&academicYear=2025-26&course=BCA
router.get('/relation', verifyRoles('admin', 'faculty'), getCoPoRelation);


// This matches the <form action="/api/copo/save-relation" method="POST">

router.post('/save-relation', verifyRoles('admin', 'faculty'), saveCoPoRelation);

module.exports = router;