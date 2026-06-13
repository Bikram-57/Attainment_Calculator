const express = require('express');
const router = express.Router();

// const handleVerifyToken = require('../middleware/authVerifty');
// const handleAuthorizeRoles = require('../middleware/authAuthorize');


const { saveCoPoRelation } = require('../controllers/coPoMapping');
const { getCoPoRelation } = require('../controllers/coPoMapping');

// GET /api/copo/relation?subjectId=CA2313&academicYear=2025-26&course=BCA
// router.get('/relation', handleVerifyToken, handleAuthorizeRoles('admin', 'faculty'), getCoPoRelation);
router.get('/relation', getCoPoRelation);


// This matches the <form action="/api/copo/save-relation" method="POST">
// router.post('/save-relation', handleVerifyToken, handleAuthorizeRoles('admin', 'faculty'), saveCoPoRelation);
router.post('/save-relation', saveCoPoRelation);

module.exports = router;