const express = require('express')
const router = express.Router();

const requireLogin = require('../middleware/pageAuth');

router.get('/createUser', (req, res) => {
    return res.render('createUser')
})
router.get("/", (req, res) => {
    return res.render("home", {
        subjectId: "CA2313",      // Provide a default or get from req.query
        academicYear: "2025-26"   // Provide a default
    });
});

// router.get("/", requireLogin, something);

module.exports = router;