const jwt = require('jsonwebtoken');

async function requireLogin(req, res, next) {
    try {
        // 1. Grab the token from the NEW cookie name ('jwt')
        const token = req.cookies.jwt; 

        // 2. If no token exists, immediately redirect to the login page
        if (!token) {
            return res.redirect('/login');
        }

        // 3. Verify the token using the REFRESH SECRET
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        
        // 4. Attach the user so the EJS pages know who is logged in
        req.user = decoded;
        next();

    } catch (error) {
        // If the token is expired or tampered with, clear the NEW cookie and redirect
        res.clearCookie('jwt');
        return res.redirect('/login');
    }
}

module.exports = requireLogin;

























// const jwt = require('jsonwebtoken');

// async function requireLogin(req, res, next) {
//     try {
//         // 1. Grab the token specifically from the browser cookies
//         const token = req.cookies.token;

//         // 2. If no token exists, immediately redirect to the login page
//         if (!token) {
//             return res.redirect('/login');
//         }

//         // 3. Verify the token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
//         // 4. Attach the user so the EJS pages know who is logged in
//         req.user = decoded;
//         next();

//     } catch (error) {
//         // If the token is expired or tampered with, clear it and redirect
//         res.clearCookie('token');
//         return res.redirect('/login');
//     }
// }

// module.exports = requireLogin;