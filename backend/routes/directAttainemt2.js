const express = require('express');
const { 
    extractAttainmentLevels,
    handleGetDirectAttainment,
 } = require('../controllers/directAttainment2');

const router = express.Router();

router.post('/', extractAttainmentLevels);
router.get('/', handleGetDirectAttainment);

module.exports = router;