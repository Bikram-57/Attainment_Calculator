const bcrypt = require('bcryptjs');

const hashPassword = async (req, res, next) => {
    try {
        // If the Admin provided a password in the form
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            // Replace the plain text password with the hashed version
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }
        next(); // Proceed to the Controller
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Encryption failed" 
        });
    }
};

module.exports = hashPassword;