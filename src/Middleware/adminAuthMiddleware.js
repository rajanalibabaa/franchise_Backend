import jwt from 'jsonwebtoken'

const verifyJWT = (req, res, next) => {
    const token = req.cookies?.AccessToken || req.header("Authorization")?.replace ("Bearer ",""); // Check both cookie and header

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token,process.env.SESSION_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        req.user = decoded; // Attach the decoded user info to the request object
        next();
    });
}

export default verifyJWT