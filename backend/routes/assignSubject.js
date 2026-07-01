const express = require('express')

const verifyRoles = require('../middleware/verifyRoles');

const { 
    handleAssignSubject,
    getAllFacultyAssignments,
    getAssignedSubjectsByFaculty,
    removeSubjectFromFaculty,
    getDropdownData,
    handleGetFacultyAssignmentsByYear,

 } = require('../controllers/assignSubject')

const router  = express.Router();


router.get('/sub', verifyRoles('admin', 'faculty'), getDropdownData);
router.get('/year', verifyRoles('admin', 'faculty'), handleGetFacultyAssignmentsByYear);


router.post('/', verifyRoles('admin'), handleAssignSubject);

router.get('/:facultyId', verifyRoles('admin'), getAssignedSubjectsByFaculty);

router.get('/', verifyRoles('admin'), getAllFacultyAssignments);

router.delete('/', verifyRoles('admin'), removeSubjectFromFaculty);


module.exports = router;