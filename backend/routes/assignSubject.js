const express = require('express')

// const handleVerifyToken = require('../middleware/authVerifty');
// const handleAuthorizeRoles = require('../middleware/authAuthorize');


const { 
    handleAssignSubject,
    getAllFacultyAssignments,
    getAssignedSubjectsByFaculty,
    removeSubjectFromFaculty

 } = require('../controllers/assignSubject')

const router  = express.Router();

// router.post('/', handleVerifyToken, handleAuthorizeRoles('admin'), handleAssignSubject);
router.post('/', handleAssignSubject);

// router.get('/:facultyId', handleVerifyToken, handleAuthorizeRoles('admin'), getAssignedSubjectsByFaculty);
router.get('/:facultyId', getAssignedSubjectsByFaculty);

// router.get('/', handleVerifyToken, handleAuthorizeRoles('admin'), getAllFacultyAssignments);
router.get('/', getAllFacultyAssignments);

// router.delete('/', handleVerifyToken, handleAuthorizeRoles('admin'), removeSubjectFromFaculty);
router.delete('/', removeSubjectFromFaculty);

module.exports = router;