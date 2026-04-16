const express = require('express');
const router = express.Router();
const  handleLogin  = require('../controllers/login');

// Define the POST route for login
router.post('/', handleLogin);

module.exports = router;