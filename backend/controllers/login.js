const User = require('../models/user'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

async function handleLogin(req, res) {
    try {
        const { email, password } = req.body;

        // 1. Check for missing inputs
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide email and password' 
            });
        }

        // 2. Fetch user from DB (Must use .select('+password') to retrieve the hash)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // 3. Verify the password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // 4. Create the JWT Payload
        const payload = {
            id: user._id,
            facultyId: user.facultyId,
            role: user.role
        };

        // 5. Sign the token
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1d' // Token expires in 1 day
        });

        // ==========================================
        // 🆕 NEW: Set the JWT as an HttpOnly Cookie
        // ==========================================
        res.cookie('token', token, {
            httpOnly: true, // Security: Prevents client-side JS from stealing the cookie
            maxAge: 24 * 60 * 60 * 1000 // Expires in 1 day (matches JWT expiration)
        });

        // 6. Send the successful response
        res.status(200).json({
            success: true,
            message: "Login successful",
            token, // Keep this here so you can still copy it in Postman
            user: {
                facultyId: user.facultyId,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login', 
            error: error.message 
        });
    }
} 

// Exporting the function directly
module.exports = handleLogin;


// const User = require('../models/user'); 
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');

// async function handleLogin(req, res) {
//     try {
//         const { email, password } = req.body;

//         // 1. Check for missing inputs
//         if (!email || !password) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: 'Please provide email and password' 
//             });
//         }

//         // 2. Fetch user from DB (Must use .select('+password') to retrieve the hash)
//         const user = await User.findOne({ email }).select('+password');
//         if (!user) {
//             return res.status(401).json({ 
//                 success: false, 
//                 message: 'Invalid credentials' 
//             });
//         }

//         // 3. Verify the password using bcrypt
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ 
//                 success: false, 
//                 message: 'Invalid credentials' 
//             });
//         }

//         // 4. Create the JWT Payload
//         const payload = {
//             id: user._id,
//             facultyId: user.facultyId,
//             role: user.role
//         };

//         // 5. Sign the token
//         const token = jwt.sign(payload, process.env.JWT_SECRET, {
//             expiresIn: '1d' // Token expires in 1 day
//         });

//         // 6. Send the successful response
//         res.status(200).json({
//             success: true,
//             token,
//             user: {
//                 facultyId: user.facultyId,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//                 profileImage: user.profileImage
//             }
//         });

//     } catch (error) {
//         res.status(500).json({ 
//             success: false, 
//             message: 'Server error during login', 
//             error: error.message 
//         });
//     }
// } // <-- Removed the stray semicolon here

// // Exporting the function directly
// module.exports = handleLogin;