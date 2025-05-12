import crypto from "crypto"

export const generateOTP = () =>
    crypto.randomInt(100000, 999999).toString(); 
    // Math.floor(100000 + Math.random() * 900000).toString();

export const getExpiryTime = () => new Date(Date.now() + 5 * 60 * 1000); // 5 mins from now
