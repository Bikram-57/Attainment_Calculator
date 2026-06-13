const express = require('express');
const router = express.Router();

// 1. Make sure you import BOTH functions now
const { handleLogin, handleRefreshToken } = require('../controllers/authController'); 

// 2. Your existing login route
router.post('/', handleLogin);

router.post('/refresh', handleRefreshToken);

module.exports = router;


















// const express = require('express');
// const router = express.Router();
// const  handleLogin  = require('../controllers/login');

// // Define the POST route for login
// router.post('/', handleLogin);

// module.exports = router;