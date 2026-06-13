const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // req.role was attached by your verifyJWT middleware earlier
        if (!req?.role) return res.status(401).json({ message: 'Role missing from token.' });
        
        // Check if the user's role is in the list of allowed roles for this route
        const isAuthorized = allowedRoles.includes(req.role);
        
        if (!isAuthorized) {
            return res.status(403).json({ message: 'Forbidden. You do not have permission.' });
        }
        
        next();
    }
}

module.exports = verifyRoles;