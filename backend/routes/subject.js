const express = require('express')

const verifyRoles = require('../middleware/verifyRoles');


const {
    handleGenerateNewSubject,
    handleUpdateSubject,
    handleGetSubjectBySubjectId,
    handleGetAllSubject,
    handleDeleteSubject
} = require('../controllers/subject')

const router = express.Router()


router.post('/', verifyRoles('admin'), handleGenerateNewSubject)


router.put('/:id', verifyRoles('admin'), handleUpdateSubject)


router.get('/:id', verifyRoles('admin'), handleGetSubjectBySubjectId)


router.get('/', verifyRoles('admin' , 'faculty'), handleGetAllSubject)


router.delete('/:id', verifyRoles('admin'), handleDeleteSubject)

module.exports = router