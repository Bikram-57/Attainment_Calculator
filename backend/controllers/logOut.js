const User = require('../models/user');

const handleLogout = async (req, res) => {
    // On client side, also delete the accessToken from memory

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); // No content
    const refreshToken = cookies.jwt;

    // Is the token in the database?
    const foundUser = await User.findOne({ refreshTokens: refreshToken }).exec();
    
    if (!foundUser) {
        // Token isn't in DB, but cookie exists. Just clear the cookie.
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: process.env.NODE_ENV === 'production' });
        return res.sendStatus(204);
    }

    // Delete the specific refresh token from the array
    foundUser.refreshTokens = foundUser.refreshTokens.filter(rt => rt !== refreshToken);
    await foundUser.save();

    // Clear the cookie
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: process.env.NODE_ENV === 'production' });
    res.sendStatus(204);
};

module.exports = { handleLogout };