const express = require('express')

const { 
    handleAssignSubject,
    getAllFacultyAssignments,
    getAssignedSubjectsByFaculty,
    removeSubjectFromFaculty

 } = require('../controllers/assignSubject')

const router  = express.Router();

router.post('/', handleAssignSubject);
router.get('/:facultyId', getAssignedSubjectsByFaculty);
router.get('/', getAllFacultyAssignments);
router.delete('/', removeSubjectFromFaculty);

module.exports = router;