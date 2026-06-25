const express = require('express');
const router = express.Router();

// Import YOUR existing middleware exactly where it lives
const verifyJWT = require('../middleware/verifyJWT'); 
const dashboardController = require('../controllers/activities');

// Protect the route with your middleware
router.get('/activities', verifyJWT, dashboardController.getMyDashboardFeed);

module.exports = router;