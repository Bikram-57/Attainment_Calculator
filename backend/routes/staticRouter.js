const express = require('express')



const staticRouter = express.Router();

staticRouter.get('/createUser', (req, res) => {
    return res.render('createUser')
})
staticRouter.get("/", (req, res) => {
    return res.render("home", {
        subjectId: "CA2313",      // Provide a default or get from req.query
        academicYear: "2025-26"   // Provide a default
    });
});

module.exports = staticRouter;