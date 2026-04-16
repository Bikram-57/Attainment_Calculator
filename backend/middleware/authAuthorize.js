function handleAuthorizeRoles(...allowedRoles) {
    
    // Return the actual async middleware function
    return async function (req, res, next) {
        
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Access forbidden. Role '${req.user?.role}' is not authorized to access this route.` 
            });
        }
        
        next();
    };
}

// Export directly
module.exports = handleAuthorizeRoles;