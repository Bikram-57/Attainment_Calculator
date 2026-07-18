const User = require('../models/user');

const handleLogout = async (req, res) => {
    try {
        // NOTE: The frontend must also delete the Access Token from its local memory 
        // when hitting this endpoint.

        const cookies = req.cookies;
        
        // If no JWT cookie exists, we are already logged out successfully
        if (!cookies?.jwt) {
            return res.sendStatus(204); 
        }

        const refreshToken = cookies.jwt;

        // 1. DATABASE OPTIMIZATION: Use $pull to remove the token directly in the database.
        // This completely bypasses the slow findOne() -> filter array -> save() loop.
        // If the token doesn't exist, MongoDB simply modifies 0 documents safely.
        await User.updateOne(
            { refreshTokens: refreshToken },
            { $pull: { refreshTokens: refreshToken } }
        );

        // 2. DRY CONFIGURATION: Define cookie options once
        const cookieOptions = {
            httpOnly: true, // Prevents XSS attacks
            secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' // Cross-origin policies
        };

        // 3. Clear the cookie from the user's browser
        res.clearCookie('jwt', cookieOptions);
        
        // 204 No Content - Success status without sending a JSON body
        return res.sendStatus(204);

    } catch (error) {
        console.error("Logout Error:", error);
        
        // Failsafe: Even if the database crashes, we should clear the user's 
        // local cookie so their browser isn't trapped in a broken state.
        res.clearCookie('jwt'); 
        return res.status(500).json({ message: "Internal server error during logout." });
    }
};

module.exports = { handleLogout };


// const User = require('../models/user');

// const handleLogout = async (req, res) => {
//     // On client side, also delete the accessToken from memory

//     const cookies = req.cookies;
//     if (!cookies?.jwt) return res.sendStatus(204); // No content
//     const refreshToken = cookies.jwt;

//     // Is the token in the database?
//     const foundUser = await User.findOne({ refreshTokens: refreshToken }).exec();

//     if (!foundUser) {
//         // Token isn't in DB, but cookie exists. Just clear the cookie.
//         res.clearCookie('jwt', {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite:
//                 process.env.NODE_ENV === 'production'
//                     ? 'None'
//                     : 'Lax'
//         });
//         return res.sendStatus(204);
//     }

//     // Delete the specific refresh token from the array
//     foundUser.refreshTokens = foundUser.refreshTokens.filter(rt => rt !== refreshToken);
//     await foundUser.save();

//     // Clear the cookie
//     res.clearCookie('jwt', {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite:
//             process.env.NODE_ENV === 'production'
//                 ? 'None'
//                 : 'Lax'
//     });
//     res.sendStatus(204);
// };

// module.exports = { handleLogout };
