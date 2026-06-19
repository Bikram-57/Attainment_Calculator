const express = require('express')

const {extractAttainmentLevels} = require('../controllers/directAttainment2')

const router = express.Router()

router.get('/', extractAttainmentLevels)

module.exports = router