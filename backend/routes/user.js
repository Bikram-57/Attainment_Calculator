// const express = require('express')

// const {
//     handleGenerateNewUser,
//     handleEditUserByFacultyId,
//     handleGetUserByFacultyId,
//     handleDeleteUserByFacultyId,
//     handleGetAllUsers,
// } = require('../controllers/user')

// const passwordHash = require('../middleware/PasswordHash')

// const router = express.Router();

// router.post('/', passwordHash, handleGenerateNewUser)
// router.put('/:id', handleEditUserByFacultyId);
// router.get('/:id', handleGetUserByFacultyId);
// router.delete('/:id', handleDeleteUserByFacultyId);
// router.get('/', handleGetAllUsers);


// module.exports = router;
































const express = require('express');

// --- 1. IMPORT MIDDLEWARE ---
const upload = require('../middleware/upload'); 
const passwordHash = require('../middleware/PasswordHash'); 

// --- 2. IMPORT CONTROLLERS ---
const {
    handleGenerateNewUser,
    handleEditUserByFacultyId,
    handleGetUserByFacultyId,
    handleDeleteUserByFacultyId,
    handleGetAllUsers,
    handleGetMyProfile,
    handleUserSelfUpdate,
    handleDeleteProfileImage
} = require('../controllers/user');

const router = express.Router();

// ==========================================
// 👤 USER ROUTES (For the logged-in faculty)
// ==========================================

// @route   GET /api/users/profile/:id
// @desc    User gets their own profile
router.get('/profile/:id', handleGetMyProfile);

// @route   PATCH /api/users/profile/:id
// @desc    User updates their own profile (Name and Image only - locked email & ID)
router.patch('/profile/:id', upload.single('profileImage'), handleUserSelfUpdate);

// @route   DELETE /api/users/image/:id
// @desc    Delete JUST their profile picture and reset to default
router.delete('/image/:id', handleDeleteProfileImage);


// ==========================================
// 🛡️ ADMIN ROUTES (For Dr. Krishna / Super Admin)
// ==========================================

// @route   POST /api/users/
// @desc    Create new user (includes optional image upload & password hash)
router.post('/', upload.single('profileImage'), passwordHash, handleGenerateNewUser);

// @route   PUT /api/users/:id
// @desc    Admin updates everything (Name, Email, Image)
router.put('/:id', upload.single('profileImage'), handleEditUserByFacultyId);

// @route   GET /api/users/:id
// @desc    Get a specific user's details
router.get('/:id', handleGetUserByFacultyId);

// @route   DELETE /api/users/:id
// @desc    Delete the entire user account (and removes their image from the server)
router.delete('/:id', handleDeleteUserByFacultyId);

// @route   GET /api/users/
// @desc    Get a list of all users (excludes Super Admin)
router.get('/', handleGetAllUsers);

// --- 3. EXPORT ROUTER ---
module.exports = router;