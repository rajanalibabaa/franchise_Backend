export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const getExpiryTime = () => new Date(Date.now() + 5 * 60 * 1000); // 5 mins from now
