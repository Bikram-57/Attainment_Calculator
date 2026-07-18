const User = require('../models/user'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Initial Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // --- SANITIZATION ---
        // Prevents login failures caused by accidental spaces or mobile auto-capitalization
        const cleanEmail = email.trim().toLowerCase();

        // 2. Fetch User
        // Using .select('+password') forcefully grabs the password if it is hidden by default in the Schema
        const foundUser = await User.findOne({ email: cleanEmail }).select('+password').exec();
        
        if (!foundUser) {
            // Generic error message prevents attackers from discovering which emails are registered
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 3. Status Check (Block suspended/inactive users immediately)
        if (foundUser.status !== 'active') {
            return res.status(403).json({
                message: `Access denied. Your account is currently ${foundUser.status}.`
            });
        }

        // 4. Password Check
        const match = await bcrypt.compare(password, foundUser.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 5. Token Generation
        // Access Token: Short lifespan (15m). Passed in headers for immediate API access.
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "userId": foundUser._id,
                    "facultyId": foundUser.facultyId,
                    "role": foundUser.role
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        // Refresh Token: Long lifespan (1d). Stored in an HttpOnly cookie to securely request new Access Tokens.
        const refreshToken = jwt.sign(
            { "userId": foundUser._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        // 6. Database Cleanup & Session Management
        let validTokensArray = [];
        
        // A. Filter out expired tokens
        // Synchronously verifying tokens here is fast and safe because the array is capped at 3
        if (foundUser.refreshTokens?.length > 0) {
            validTokensArray = foundUser.refreshTokens.filter(token => {
                try {
                    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
                    return true; // Token is still valid, keep it
                } catch (err) {
                    return false; // Token is expired/invalid, remove it
                }
            });
        }

        // B. Strict Session Limit (Max 3 Devices)
        const MAX_SESSIONS = 3;
        if (validTokensArray.length >= MAX_SESSIONS) {
            // Slice off the oldest token(s) to make room for the new one we are about to push
            validTokensArray = validTokensArray.slice(-(MAX_SESSIONS - 1));
        }

        // C. Save the updated session list back to the database
        validTokensArray.push(refreshToken);
        foundUser.refreshTokens = validTokensArray;
        await foundUser.save();

        // 7. Send the Secure Cookie
        res.cookie('jwt', refreshToken, {
            httpOnly: true, // Crucial: Prevents frontend JavaScript from accessing the cookie (XSS protection)
            secure: process.env.NODE_ENV === 'production', // Requires HTTPS in production
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Cross-Origin routing rules
            maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
        });

        // 8. Send the Final Response
        return res.status(200).json({
            message: 'Login successful',
            accessToken,
            user: {
                facultyId: foundUser.facultyId,
                email: foundUser.email,
                name: foundUser.name,
                role: foundUser.role,
                profileImage: foundUser.profileImage
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { handleLogin };
// const User = require('../models/user'); // Ensure this path matches your structure
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const handleLogin = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // 1. Initial Validation
//         if (!email || !password) {
//             return res.status(400).json({ message: 'Email and password are required.' });
//         }

//         // 2. Fetch User (using .select('+password') if it is hidden in your schema)
//         const foundUser = await User.findOne({ email }).select('+password').exec();
//         if (!foundUser) {
//             return res.status(401).json({ message: 'Invalid credentials.' });
//         }

//         // 3. Status Check (Block inactive users immediately)
//         if (foundUser.status !== 'active') {
//             return res.status(403).json({
//                 message: `Access denied. Your account is currently ${foundUser.status}.`
//             });
//         }

//         // 4. Password Check
//         const match = await bcrypt.compare(password, foundUser.password);
//         if (!match) {
//             return res.status(401).json({ message: 'Invalid credentials.' });
//         }

//         // 5. Token Generation
//         // Access Token: Short lifespan (15m). Includes facultyId and role.
//         const accessToken = jwt.sign(
//             {
//                 "UserInfo": {
//                     "userId": foundUser._id,
//                     "facultyId": foundUser.facultyId,
//                     "role": foundUser.role
//                 }
//             },
//             process.env.ACCESS_TOKEN_SECRET,
//             { expiresIn: '15m' }
//         );

//         // Refresh Token: Long lifespan (1d). Only needs the user ID.
//         const refreshToken = jwt.sign(
//             { "userId": foundUser._id },
//             process.env.REFRESH_TOKEN_SECRET,
//             { expiresIn: '1d' }
//             // { expiresIn: '5s' }
//         );

//         // 6. Database Cleanup & Session Limit
//         let validTokensArray = [];
        
//         // A. Filter out any expired tokens currently in the database
//         if (foundUser.refreshTokens && foundUser.refreshTokens.length > 0) {
//             validTokensArray = foundUser.refreshTokens.filter(token => {
//                 try {
//                     jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
//                     return true; // Still alive, keep it
//                 } catch (err) {
//                     return false; // Expired, throw it away
//                 }
//             });
//         }

//         // B. Strict Session Limit (Max 3 Devices)
//         const MAX_SESSIONS = 3;
//         if (validTokensArray.length >= MAX_SESSIONS) {
//             // Keep only the newest ones to make room for the token we are about to push
//             validTokensArray = validTokensArray.slice(-(MAX_SESSIONS - 1));
//         }

//         // C. Add the brand new token and save to DB
//         validTokensArray.push(refreshToken);
//         foundUser.refreshTokens = validTokensArray;
//         await foundUser.save();

//         // 7. Send the secure cookie
//         res.cookie('jwt', refreshToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
//             maxAge: 1 * 24 * 60 * 60 * 1000 // 1 day in milliseconds
//         });

//         // 8. Send the final response to the frontend
//         res.json({
//             message: 'Login successful',
//             accessToken,
//             user: {
//                 facultyId: foundUser.facultyId,
//                 email: foundUser.email,
//                 name: foundUser.name,
//                 role: foundUser.role,
//                 profileImage: foundUser.profileImage
//             }
//         });

//     } catch (error) {
//         console.error("Login Error:", error);
//         res.status(500).json({ message: 'Internal server error.' });
//     }
// };

// module.exports = { handleLogin };