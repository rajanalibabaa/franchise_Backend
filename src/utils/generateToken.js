import jwt from 'jsonwebtoken';

// Function to generate a JWT token
export const generateToken = (payload, secretKey, expiresIn) => {
    return jwt.sign(payload, secretKey, { expiresIn });
};

// Function to verify a JWT token
 export const verifyToken = (token, secretKey) => {
    try {
        return jwt.verify(token, secretKey);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

