const jwt = require('jsonwebtoken');

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No valid token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Decode token (Ensure your token payload has 'userId' and 'role')
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user payload to request
    req.user = decoded; 
    
    next();
  } catch (error) {
    // If expired, frontend handles the refresh token swap
    return res.status(403).json({ success: false, message: 'Invalid or expired access token.' });
  }
};

module.exports = verifyAccessToken;