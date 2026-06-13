const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    // Check if header exists and starts with 'Bearer '
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Invalid or expired token' }); // Forbidden
            
            // Attach user details to the request object so controllers can use them
            req.user = decoded.UserInfo.userId;
            req.facultyId = decoded.UserInfo.facultyId;
            req.role = decoded.UserInfo.role;
            
            next();
        }
    );
};

module.exports = verifyJWT;