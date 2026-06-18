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


router.post('/', verifyRoles('admin'), handleGenerateNewSubject)


router.put('/:id', verifyRoles('admin'), handleUpdateSubject)


router.get('/:id', verifyRoles('admin'), handleGetSubjectBySubjectId)


router.get('/', verifyRoles('admin' , 'faculty'), handleGetAllSubject)


router.delete('/:id', verifyRoles('admin'), handleDeleteSubject)


router.get('/year/:academicYear', verifyRoles('admin'), handleGetSubjectsByAcademicYear)


router.get('/year/:academicYear/course/:course', verifyRoles('admin'), handleGetSubjectsByYearAndCourse);

router.get('/sem', verifyRoles('admin' , 'faculty'), handleGetSubjectsBySemester);

module.exports = router