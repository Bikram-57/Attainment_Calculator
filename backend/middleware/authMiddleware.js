const jwt = require('jsonwebtoken');

// GUARD 1: Check if user is logged in
const verifyToken = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Access Denied. Please log in." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_development_secret');
        req.user = decoded; // Contains id, facultyId, and role
        next(); 
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or Expired Token. Please log in again." });
    }
};

// GUARD 2: Check if user has the right role
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: "Forbidden. You do not have admin permissions." 
            });
        }
        next();
    };
};

module.exports = { verifyToken, checkRole };