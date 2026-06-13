const User = require('../models/user');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    // Check if the cookie exists
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    
    const refreshToken = cookies.jwt;

    // Find the user who has this specific refresh token in their array
    const foundUser = await User.findOne({ refreshTokens: refreshToken }).exec();
    if (!foundUser) return res.sendStatus(403); // Forbidden

    // Verify the token
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || foundUser._id.toString() !== decoded.userId) {
                return res.sendStatus(403);
            }

            // Issue a new Access Token
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

            res.json({ accessToken });
        }
    );
};

module.exports = { handleRefreshToken };