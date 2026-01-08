const express = require('express')

const {
    handleGenerateNewUser,
    handleGetUserByFacultyId,
    handleDeleteUserByFacultyId,
    handleEditUserByFacultyId
} = require('../controllers/user')

const router = express.Router();

router.post('/', handleGenerateNewUser)
router.get('/id/:facultyId', handleGetUserByFacultyId);
router.delete('/id/:facultyId', handleDeleteUserByFacultyId);
router.put('/id/:facultyId', handleEditUserByFacultyId);


module.exports = router;