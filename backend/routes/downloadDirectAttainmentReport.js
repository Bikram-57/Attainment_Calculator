const express = require('express');
const {
    downloadDirectPoReport
} = require('../controllers/downloadDirectAttainmentReport');

const router = express.Router();

router.post('/direct-po', downloadDirectPoReport);
// router.get('/direct-po', downloadDirectPoReport);

module.exports = router;