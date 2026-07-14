// const User = require('../models/user'); // Make sure this path matches your structure
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const handleLogin = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({ message: 'Email and password are required.' });
//         }

//         // IMPORTANT: Because password has `select: false` in your schema, 
//         // we MUST use .select('+password') to pull it for the comparison.
//         const foundUser = await User.findOne({ email }).select('+password').exec();

//         if (!foundUser) {
//             return res.status(401).json({ message: 'Invalid credentials.' });
//         }

//         // --- STATUS CHECK ---
//         // Block login immediately if they aren't active
//         if (foundUser.status !== 'active') {
//             return res.status(403).json({
//                 message: `Access denied. Your account is currently ${foundUser.status}.`
//             });
//         }

//         // --- PASSWORD CHECK ---
//         const match = await bcrypt.compare(password, foundUser.password);
//         if (!match) {
//             return res.status(401).json({ message: 'Invalid credentials.' });
//         }

//         // --- TOKEN GENERATION ---
//         // Access Token: Short lifespan (e.g., 15m). Include facultyId and role.
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

//         // Refresh Token: Long lifespan (e.g., 7d).
//         const refreshToken = jwt.sign(
//             { "userId": foundUser._id },
//             process.env.REFRESH_TOKEN_SECRET,
//             { expiresIn: '1d' }
//         );

//         // --- SAVE REFRESH TOKEN ---
//         // Since your schema uses an array, we push the new token so we don't overwrite existing sessions
//         foundUser.refreshTokens.push(refreshToken);
//         await foundUser.save();

//         // Send refresh token in a secure HttpOnly cookie
//         // res.cookie('jwt', refreshToken, { 
//         //     httpOnly: true, 
//         //     secure: process.env.NODE_ENV === 'production', 
//         //     sameSite: 'None', 
//         //     maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
//         // });

//         res.cookie('jwt', refreshToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite:
//                 process.env.NODE_ENV === 'production'
//                     ? 'None'
//                     : 'Lax',
//             maxAge: 1 * 24 * 60 * 60 * 1000
//         });

//         // Send access token and user info to the frontend
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




const User = require('../models/user'); // Ensure this path matches your structure
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Initial Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // 2. Fetch User (using .select('+password') if it is hidden in your schema)
        const foundUser = await User.findOne({ email }).select('+password').exec();
        if (!foundUser) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 3. Status Check (Block inactive users immediately)
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
        // Access Token: Short lifespan (15m). Includes facultyId and role.
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

        // Refresh Token: Long lifespan (1d). Only needs the user ID.
        const refreshToken = jwt.sign(
            { "userId": foundUser._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
            // { expiresIn: '5s' }
        );

        // 6. Database Cleanup & Session Limit
        let validTokensArray = [];
        
        // A. Filter out any expired tokens currently in the database
        if (foundUser.refreshTokens && foundUser.refreshTokens.length > 0) {
            validTokensArray = foundUser.refreshTokens.filter(token => {
                try {
                    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
                    return true; // Still alive, keep it
                } catch (err) {
                    return false; // Expired, throw it away
                }
            });
        }

        // B. Strict Session Limit (Max 3 Devices)
        const MAX_SESSIONS = 3;
        if (validTokensArray.length >= MAX_SESSIONS) {
            // Keep only the newest ones to make room for the token we are about to push
            validTokensArray = validTokensArray.slice(-(MAX_SESSIONS - 1));
        }

        // C. Add the brand new token and save to DB
        validTokensArray.push(refreshToken);
        foundUser.refreshTokens = validTokensArray;
        await foundUser.save();

        // 7. Send the secure cookie
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 1 * 24 * 60 * 60 * 1000 // 1 day in milliseconds
        });

        // 8. Send the final response to the frontend
        res.json({
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
        res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { handleLogin };