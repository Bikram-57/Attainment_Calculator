const express = require('express')

const { 
    handleAssignSubject,
    getAssignedSubjectsByFaculty

 } = require('../controllers/assignSubject')

const router  = express.Router();

router.post('/', handleAssignSubject);
router.get('/:facultyId', getAssignedSubjectsByFaculty);

module.exports = router;