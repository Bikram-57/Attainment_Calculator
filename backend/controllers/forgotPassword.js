// controllers/authController.js
const User = require('../models/user');
const sendEmail = require('../utils/mailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ==========================================
// PART 1: Request OTP (First Screen)
// ==========================================
const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      // Return a generic success message to hide user existence
      return res.status(200).json({ message: "If account exists, an OTP has been sent." });
    }

    // 1. Generate a secure numeric 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // 2. Hash the OTP using bcrypt before saving it to the database
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // 3. Store the hashed OTP and set expiration to 10 minutes from now
    user.resetOtp = hashedOtp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // 4. Send the raw unhashed OTP to the user's email inbox
    const message = `Your password reset verification code is: ${otp}. It will expire in 10 minutes.`;
    await sendEmail(user.email, "Password Reset Verification Code", message);

    res.status(200).json({ message: "OTP sent successfully to your email." });
  } catch (error) {
    res.status(500).json({ message: "Server error during OTP generation" });
  }
};

// ==========================================
// PART 2: Verify OTP (Second Screen)


const verifyOtp = async (req, res) => {
  try {
    // 1. Extract and validate input
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // 2. Find the user (case-insensitive search to prevent typos)
    const user = await User.findOne({ email: email.toLowerCase() });

    // --- DEBUGGING LOGS (Keep these until it works perfectly) ---
    console.log("1. Did I find the user?", user ? user.email : "NO USER FOUND");
    console.log("2. What is saved in resetOtp?", user ? user.resetOtp : "N/A");
    console.log("3. What is the expiration time?", user ? user.resetOtpExpires : "N/A");
    // ------------------------------------------------------------

    // 3. Verify user exists and actually has an active OTP process
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return res.status(400).json({ message: "Invalid request or OTP expired" });
    }

    // 4. Check if the 10-minute window has expired
    if (Date.now() > user.resetOtpExpires) {
      // Optional: You could also clear the expired OTP fields here if you want
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // 5. Compare the raw 6-digit code with the hashed version in the database
    const isMatch = await bcrypt.compare(otp, user.resetOtp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP code" });
    }

    // 6. Generate the temporary "Golden Ticket" for Step 3 (valid for 5 mins)
    const resetToken = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '5m' }
    );

    // 7. Send the token back to the frontend/Postman
    return res.status(200).json({ 
      message: "OTP verified successfully.", 
      resetToken 
    });

  } catch (error) {
    console.error("Error in verifyOtp:", error);
    return res.status(500).json({ message: "Server error during OTP verification" });
  }
};



// ==========================================
// const verifyOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

//     const user = await User.findOne({ email });
//     if (!user || !user.resetOtp || !user.resetOtpExpires) {
//       return res.status(400).json({ message: "Invalid request or OTP expired" });
//     }

//     // 1. Check if OTP has expired
//     if (Date.now() > user.resetOtpExpires) {
//       return res.status(400).json({ message: "OTP has expired. Please request a new one." });
//     }

//     // 2. Compare user input OTP with the stored hashed OTP
//     const isMatch = await bcrypt.compare(otp, user.resetOtp);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid OTP code" });
//     }

//     // 3. Issue a short-lived temporary JWT token (valid for 5 mins) to give access to Step 3
//     const resetToken = jwt.sign(
//       { userId: user._id }, 
//       process.env.JWT_SECRET, 
//       { expiresIn: '5m' }
//     );

//     res.status(200).json({ 
//       message: "OTP verified successfully.", 
//       resetToken // Frontend must catch this and send it to the next screen
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error during OTP verification" });
//   }
// };

// ==========================================
// PART 3: Reset Password (Third Screen)
// ==========================================
const resetPassword = async (req, res) => {
  try {
    const { newPassword, resetToken } = req.body;
    if (!newPassword || !resetToken) {
      return res.status(400).json({ message: "Missing new password or token." });
    }

    // 1. Decode and verify the temporary token received from step 2
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Reset token expired or invalid. Restart the process." });
    }

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Hash the new password securely
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // 3. Clear the OTP fields completely so they cannot be reused
    user.resetOtp = null;
    user.resetOtpExpires = null;
    await user.save();

    res.status(200).json({ message: "Password updated successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Server error during password resetting" });
  }
};

module.exports = {
  requestOtp,
  verifyOtp,
  resetPassword
};