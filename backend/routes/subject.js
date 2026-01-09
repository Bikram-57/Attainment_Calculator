const express = require('express')

const {
    handleGenerateNewSubject,
    handleGetSubjectBySubjectId,
    handleUpdateSubject,
    handleDeleteSubject
 } = require('../controllers/subject')

 const router = express.Router()

router.post('/', handleGenerateNewSubject)
router.get('/:subjectId', handleGetSubjectBySubjectId)
router.put('/:subjectId', handleUpdateSubject)
router.delete('/:subjectId', handleDeleteSubject)


module.exports = router