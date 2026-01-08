const express = require('express')



const staticRouter = express.Router();

staticRouter.get('/createUser', (req, res) => {
    return res.render('createUser')
})

module.exports = staticRouter;