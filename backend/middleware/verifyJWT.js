// const jwt = require('jsonwebtoken');

// const verifyJWT = (req, res, next) => {
//     const authHeader = req.headers.authorization || req.headers.Authorization;

//     // Check if header exists and starts with 'Bearer '
//     if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

//     const token = authHeader.split(' ')[1];


//     jwt.verify(
//         token,
//         process.env.ACCESS_TOKEN_SECRET,
//         (err, decoded) => {
//             if (err) {
//                 if (err.name === 'TokenExpiredError') {
//                     return res.status(401).json({
//                         message: 'Access token expired'
//                     });
//                 }

//                 return res.status(403).json({
//                     message: 'Invalid token'
//                 });
//             }

//             req.user = decoded.UserInfo.userId;
//             req.facultyId = decoded.UserInfo.facultyId;
//             req.role = decoded.UserInfo.role;

//             next();
//         }
//     );

// };

// module.exports = verifyJWT;





















const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Ensure the request contains a valid Bearer token
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) {
                // Differentiate between expired (trigger frontend refresh) and invalid (force logout)
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ message: 'Access token expired' });
                }
                return res.status(403).json({ message: 'Invalid token' });
            }

            // Safely attach decoded data to the request object for downstream controllers to use
            req.user = decoded?.UserInfo?.userId;
            req.facultyId = decoded?.UserInfo?.facultyId;
            req.role = decoded?.UserInfo?.role;

            next();
        }
    );
};

module.exports = verifyJWT;