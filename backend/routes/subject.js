const express = require('express')

const {
    handleGenerateNewSubject,
    handleUpdateSubject,
    handleGetSubjectBySubjectId,
    handleGetAllSubject,
    handleDeleteSubject
} = require('../controllers/subject')

const router = express.Router()

router.post('/', handleGenerateNewSubject)
router.put('/:id', handleUpdateSubject)
router.get('/:id', handleGetSubjectBySubjectId)
router.get('/', handleGetAllSubject)
router.delete('/:id', handleDeleteSubject)

module.exports = router