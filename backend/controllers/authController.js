const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ==========================================
// 1. UPDATED LOGIN CONTROLLER
// ==========================================
async function handleLogin(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please provide email and password" });
        }

        // Find user and get password for comparison
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Create Payload
        const payload = { 
            id: user._id, 
            facultyId: user.facultyId, 
            role: user.role 
        };

        // 👇 NEW: GENERATE BOTH TOKENS 👇
        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'fallback_development_secret',
            // { expiresIn: '15m' } // Short life for security
            { expiresIn: '15s' } // Short life for security
        );

        const refreshToken = jwt.sign(
            payload,
            process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
            { expiresIn: '7d' } // Long life for convenience
        );

        // 👇 NEW: Save the refresh token to the database 👇
        user.refreshTokens.push(refreshToken);
        await user.save();

        // Send response with BOTH tokens for your React developer
        res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken: accessToken,   // Replaced "token" with "accessToken"
            refreshToken: refreshToken, // Added the refresh token
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










// async function handleLogin(req, res) {
//     try {
//         console.log("👉 1. Login route hit!");
//         const { email, password } = req.body;

//         if (!email || !password) {
//             console.log("❌ 2. Missing email or password");
//             return res.status(400).json({ success: false, message: "Please provide email and password" });
//         }

//         console.log(`👉 3. Searching database for email: ${email}`);
        
//         // IF YOUR APP IS STUCK, IT IS USUALLY RIGHT HERE 👇
//         const user = await User.findOne({ email }).select('+password');
        
//         console.log("👉 4. Database responded!");

//         if (!user) {
//             console.log("❌ 5. User not found in DB");
//             return res.status(401).json({ success: false, message: "Invalid credentials" });
//         }

//         console.log("👉 6. User found! Checking password...");
//         const isMatch = await bcrypt.compare(password, user.password);
        
//         if (!isMatch) {
//             console.log("❌ 7. Password incorrect");
//             return res.status(401).json({ success: false, message: "Invalid credentials" });
//         }

//         console.log("👉 8. Password matches! Generating tokens...");
        
//         // ... (Rest of your token generation code stays exactly the same) ...

//         console.log("✅ 9. Success! Sending response back to test script.");
//         res.status(200).json({
//             success: true,
//             message: "Login successful",
//             accessToken: accessToken,   
//             refreshToken: refreshToken, 
//             // ... (user object)
//         });

//     } catch (error) {
//         console.error("❌ Catch Block Error:", error.message);
//         res.status(500).json({ success: false, message: "Server error during login" });
//     }
// }

// ==========================================
// 2. NEW REFRESH TOKEN CONTROLLER
// ==========================================
async function handleRefreshToken(req, res) {
    try {
        // React will send the refresh token in the body of the request
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ success: false, message: "No refresh token provided" });
        }

        // Find the user who has this token in their array
        const user = await User.findOne({ refreshTokens: refreshToken });
        if (!user) {
            return res.status(403).json({ success: false, message: "Invalid refresh token" });
        }

        // Verify the token
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret', (err, decoded) => {
            if (err || user.facultyId !== decoded.facultyId) {
                return res.status(403).json({ success: false, message: "Token expired or invalid" });
            }

            // If valid, issue a BRAND NEW 15-minute Access Token
            const payload = {
                id: user._id,
                facultyId: user.facultyId,
                role: user.role
            };
            
            const newAccessToken = jwt.sign(
                payload, 
                process.env.JWT_SECRET || 'fallback_development_secret', 
                { expiresIn: '15m' }
            );

            // Send it back to React
            res.status(200).json({ 
                success: true, 
                accessToken: newAccessToken 
            });
        });

    } catch (error) {
        console.error("Refresh Error:", error.message);
        res.status(500).json({ success: false, message: "Server error during token refresh" });
    }
}

// Export BOTH functions now!
module.exports = { handleLogin, handleRefreshToken };










































// const User = require('../models/user');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// async function handleLogin(req, res) {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({ success: false, message: "Please provide email and password" });
//         }

//         // 1. Find user. 
//         // CRITICAL: Because your schema has `select: false` for password, 
//         // we MUST use `.select('+password')` here to retrieve it for comparison!
//         const user = await User.findOne({ email }).select('+password');
        
//         if (!user) {
//             return res.status(401).json({ success: false, message: "Invalid credentials" });
//         }

//         // 2. Compare the entered password with the hashed password in DB
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ success: false, message: "Invalid credentials" });
//         }

//         // 3. Generate JWT Token
//         // Create your own secret key and put it in your .env file as JWT_SECRET
//         const token = jwt.sign(
//             { id: user._id, facultyId: user.facultyId, role: user.role },
//             process.env.JWT_SECRET || 'fallback_development_secret',
//             { expiresIn: '1d' } // Token lasts for 1 day
//         );

//         // 4. Send response (Do NOT send the password back!)
//         res.status(200).json({
//             success: true,
//             message: "Login successful",
//             token: token,
//             user: {
//                 id: user._id,
//                 facultyId: user.facultyId,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//                 profilePicture: user.profilePicture
//             }
//         });

//     } catch (error) {
//         console.error("Login Error:", error.message);
//         res.status(500).json({ success: false, message: "Server error during login" });
//     }
// }

// module.exports = { handleLogin };