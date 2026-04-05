const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function handleLogin(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please provide email and password" });
        }

        // 1. Find user. 
        // CRITICAL: Because your schema has `select: false` for password, 
        // we MUST use `.select('+password')` here to retrieve it for comparison!
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // 2. Compare the entered password with the hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // 3. Generate JWT Token
        // Create your own secret key and put it in your .env file as JWT_SECRET
        const token = jwt.sign(
            { id: user._id, facultyId: user.facultyId, role: user.role },
            process.env.JWT_SECRET || 'fallback_development_secret',
            { expiresIn: '1d' } // Token lasts for 1 day
        );

        // 4. Send response (Do NOT send the password back!)
        res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                facultyId: user.facultyId,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture
            }
        });

    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ success: false, message: "Server error during login" });
    }
}

module.exports = { handleLogin };