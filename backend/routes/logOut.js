const express = require('express');
const router = express.Router();
const { handleLogout } = require('../controllers/logOut');

router.post('/', handleLogout);

module.exports = router;