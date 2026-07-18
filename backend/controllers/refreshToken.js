const User = require('../models/user');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    try {
        const cookies = req.cookies;
        
        // 1. Check if the JWT cookie exists
        if (!cookies?.jwt) {
            return res.status(401).json({ message: 'No refresh token found.' });
        }
        
        const refreshToken = cookies.jwt;

        // 2. DATABASE OPTIMIZATION: Projection + .lean()
        // We only fetch the specific fields we need to build the payload. 
        // .lean() returns a pure JS object, bypassing heavy Mongoose hydration.
        const foundUser = await User.findOne(
            { refreshTokens: refreshToken },
            'status facultyId email name role profileImage' 
        ).lean();

        if (!foundUser) {
            // SECURITY: If the token isn't in the DB, clear the orphaned cookie from the browser
            res.clearCookie('jwt', { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' 
            });
            return res.status(403).json({ message: 'Invalid refresh token.' });
        }

        // 3. STRICT STATUS CHECK
        // Blocks users immediately if an admin suspended their account mid-session
        if (foundUser.status !== 'active') {
            return res.status(403).json({ message: `Access denied. Your account is currently ${foundUser.status}.` });
        }

        // 4. Verify the Refresh Token Signature and Expiration
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                // If token is expired, tampered with, or doesn't match the DB user ID
                if (err || foundUser._id.toString() !== decoded.userId) {
                    
                    // GARBAGE COLLECTION: If it expired, remove it from the DB to prevent array bloat.
                    // This runs asynchronously in the background so it doesn't slow down the response.
                    if (err) {
                        User.updateOne(
                            { _id: foundUser._id },
                            { $pull: { refreshTokens: refreshToken } }
                        ).catch(dbErr => console.error("Failed to clean up expired token:", dbErr));
                    }
                    
                    return res.status(403).json({ message: 'Token verification failed or token expired.' });
                }

                // 5. Generate a fresh short-lived Access Token
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

                // 6. Return both the new token AND the user profile details
                return res.status(200).json({ 
                    accessToken,
                    user: {
                        facultyId: foundUser.facultyId,
                        email: foundUser.email,
                        name: foundUser.name,
                        role: foundUser.role,
                        profileImage: foundUser.profileImage
                    }
                });
            }
        );
    } catch (error) {
        console.error("Refresh Token Error:", error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { handleRefreshToken };




// const User = require('../models/user');
// const jwt = require('jsonwebtoken');

// const handleRefreshToken = async (req, res) => {
//     const cookies = req.cookies;
    
//     // If no cookie or no JWT cookie exists, user is not logged in
//     if (!cookies?.jwt) return res.status(401).json({ message: 'No refresh token found.' });
    
//     const refreshToken = cookies.jwt;

//     try {
//         // Find the user who owns this specific refresh token string
//         const foundUser = await User.findOne({ refreshTokens: refreshToken }).exec();
//         if (!foundUser) return res.status(403).json({ message: 'Invalid refresh token.' });

//         // --- STRICT STATUS CHECK ---
//         // If an admin changed their status to inactive while they were logged in, block them here!
//         if (foundUser.status !== 'active') {
//             return res.status(403).json({ message: `Your account is currently ${foundUser.status}.` });
//         }

//         // Verify the refresh token's signature
//         jwt.verify(
//             refreshToken,
//             process.env.REFRESH_TOKEN_SECRET,
//             (err, decoded) => {
//                 // If token is tampered with or doesn't match the database user ID
//                 if (err || foundUser._id.toString() !== decoded.userId) {
//                     return res.status(403).json({ message: 'Token verification failed.' });
//                 }

//                 // 1. Generate a fresh short-lived Access Token
//                 const accessToken = jwt.sign(
//                     { 
//                         "UserInfo": {
//                             "userId": foundUser._id,
//                             "facultyId": foundUser.facultyId,
//                             "role": foundUser.role 
//                         }
//                     },
//                     process.env.ACCESS_TOKEN_SECRET,
//                     { expiresIn: '15m' }
//                 );

//                 // 2. THE FIX: Send BOTH the token AND the user details back to the frontend!
//                 res.json({ 
//                     accessToken,
//                     user: {
//                         facultyId: foundUser.facultyId,
//                         email: foundUser.email,
//                         name: foundUser.name,
//                         role: foundUser.role,
//                         profileImage: foundUser.profileImage
//                     }
//                 });
//             }
//         );
//     } catch (error) {
//         console.error("Refresh Token Error:", error);
//         res.status(500).json({ message: 'Internal server error.' });
//     }
// };

// module.exports = { handleRefreshToken };






