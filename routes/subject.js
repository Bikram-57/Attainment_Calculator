const express = require('express')

const {
    handleGenerateNewSubject
 } = require('../controllers/subject')

 const router = express.Router()

router.post('/', handleGenerateNewSubject)

module.exports = router