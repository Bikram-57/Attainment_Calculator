const express = require('express')

const verifyRoles = require('../middleware/verifyRoles');

const { 
    handleAssignSubject,
    getAllFacultyAssignments,
    getAssignedSubjectsByFaculty,
    removeSubjectFromFaculty

 } = require('../controllers/assignSubject')

const router  = express.Router();

router.post('/', verifyRoles('admin'), handleAssignSubject);

router.get('/:facultyId', verifyRoles('admin'), getAssignedSubjectsByFaculty);

router.get('/', verifyRoles('admin'), getAllFacultyAssignments);

router.delete('/', verifyRoles('admin'), removeSubjectFromFaculty);

module.exports = router;