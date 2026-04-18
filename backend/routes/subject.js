const express = require('express')

const handleVerifyToken = require('../middleware/authVerifty');
const handleAuthorizeRoles = require('../middleware/authAuthorize');


const {
    handleGenerateNewSubject,
    handleUpdateSubject,
    handleGetSubjectBySubjectId,
    handleGetAllSubject,
    handleDeleteSubject
} = require('../controllers/subject')

const router = express.Router()

// router.post('/', handleVerifyToken, handleAuthorizeRoles('admin'), handleGenerateNewSubject)
router.post('/', handleGenerateNewSubject)

// router.put('/:id', handleVerifyToken, handleAuthorizeRoles('admin'), handleUpdateSubject)
router.put('/:id', handleUpdateSubject)

// router.get('/:id', handleVerifyToken, handleAuthorizeRoles('admin'), handleGetSubjectBySubjectId)
router.get('/:id', handleGetSubjectBySubjectId)

// router.get('/', handleVerifyToken, handleAuthorizeRoles('admin'), handleGetAllSubject)
router.get('/', handleGetAllSubject)

// router.delete('/:id', handleVerifyToken, handleAuthorizeRoles('admin'), handleDeleteSubject)
router.delete('/:id', handleDeleteSubject)

module.exports = router