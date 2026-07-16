const express = require('express')

const verifyRoles = require('../middleware/verifyRoles');


const {
    handleGenerateNewSubject,
    handleUpdateSubject,
    handleGetSubjectBySubjectId,
    handleGetAllSubject,
    handleDeleteSubject,
    handleGetSubjectsByAcademicYear,
    handleGetSubjectsByYearAndCourse,
    handleGetSubjectsBySemester,
} = require('../controllers/subject')

const router = express.Router()


router.post('/', verifyRoles('admin'), handleGenerateNewSubject);

router.get('/sem', verifyRoles('admin', 'faculty'), handleGetSubjectsBySemester);

router.get('/year/:academicYear/course/:course', verifyRoles('admin'), handleGetSubjectsByYearAndCourse);

router.get('/year/:academicYear', verifyRoles('admin'), handleGetSubjectsByAcademicYear);

router.get('/', verifyRoles('admin', 'faculty'), handleGetAllSubject);

router.get('/:id', verifyRoles('admin', 'faculty'), handleGetSubjectBySubjectId);

router.put('/:id', verifyRoles('admin'), handleUpdateSubject);

router.delete('/:id', verifyRoles('admin'), handleDeleteSubject);

module.exports = router