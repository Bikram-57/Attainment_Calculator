const express = require('express')

const {
    handleGenerateNewUser,
    handleEditUserByFacultyId,
    handleGetUserByFacultyId,
    handleDeleteUserByFacultyId,
    handleGetAllUsers,
} = require('../controllers/user')

const passwordHash = require('../middleware/PasswordHash')

const router = express.Router();

router.post('/', passwordHash, handleGenerateNewUser)
router.put('/:id', handleEditUserByFacultyId);
router.get('/:id', handleGetUserByFacultyId);
router.delete('/:id', handleDeleteUserByFacultyId);
router.get('/', handleGetAllUsers);


module.exports = router;