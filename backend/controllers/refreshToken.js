const User = require('../models/user');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    
    // If no cookie or no JWT cookie exists, user is not logged in
    if (!cookies?.jwt) return res.status(401).json({ message: 'No refresh token found.' });
    
    const refreshToken = cookies.jwt;

    try {
        // Find the user who owns this specific refresh token string
        const foundUser = await User.findOne({ refreshTokens: refreshToken }).exec();
        if (!foundUser) return res.status(403).json({ message: 'Invalid refresh token.' });

        // --- STRICT STATUS CHECK ---
        // If an admin changed their status to inactive while they were logged in, block them here!
        if (foundUser.status !== 'active') {
            return res.status(403).json({ message: `Your account is currently ${foundUser.status}.` });
        }

        // Verify the refresh token's signature
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                // If token is tampered with or doesn't match the database user ID
                if (err || foundUser._id.toString() !== decoded.userId) {
                    return res.status(403).json({ message: 'Token verification failed.' });
                }

                // 1. Generate a fresh short-lived Access Token
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

                // 2. THE FIX: Send BOTH the token AND the user details back to the frontend!
                res.json({ 
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
        res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { handleRefreshToken };






















// const User = require('../models/user');
// const jwt = require('jsonwebtoken');

// const handleRefreshToken = async (req, res) => {
//     // Check if the cookie exists
//     const cookies = req.cookies;
//     if (!cookies?.jwt) return res.sendStatus(401);
    
//     const refreshToken = cookies.jwt;

//     // Find the user who has this specific refresh token in their array
//     const foundUser = await User.findOne({ refreshTokens: refreshToken }).exec();
//     if (!foundUser) return res.sendStatus(403); // Forbidden

//     // Verify the token
//     jwt.verify(
//         refreshToken,
//         process.env.REFRESH_TOKEN_SECRET,
//         (err, decoded) => {
//             if (err || foundUser._id.toString() !== decoded.userId) {
//                 return res.sendStatus(403);
//             }

//             // Issue a new Access Token
//             const accessToken = jwt.sign(
//                 { 
//                     "UserInfo": {
//                         "userId": foundUser._id,
//                         "facultyId": foundUser.facultyId,
//                         "role": foundUser.role 
//                     }
//                 },
//                 process.env.ACCESS_TOKEN_SECRET,
//                 { expiresIn: '15m' }
//             );

//             res.json({ accessToken });
//         }
//     );
// };

// module.exports = { handleRefreshToken };