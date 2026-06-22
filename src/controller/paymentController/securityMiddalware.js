// controllers/payment/securityMiddleware.js
import rateLimit from "express-rate-limit";
import crypto from "crypto";

// ✅ Rate Limiting
export const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per IP
  message: "Too many payment attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Signature Validation Middleware
export const validateRequestSignature = (req, res, next) => {
  const { signature, timestamp, ...data } = req.body;

  if (!signature || !timestamp) {
    return res.status(400).json({
      success: false,
      message: "Missing security headers",
    });
  }

  // Check timestamp (prevent replay attacks)
  const now = Date.now();
  const requestTime = parseInt(timestamp);

  if (Math.abs(now - requestTime) > 5 * 60 * 1000) {
    // 5 minutes tolerance
    return res.status(401).json({
      success: false,
      message: "Request expired",
    });
  }

  // Verify signature
  const payload = JSON.stringify(data) + timestamp;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.CLIENT_SECRET)
    .update(payload)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(401).json({
      success: false,
      message: "Invalid signature",
    });
  }

  next();
};

// ✅ IP Whitelisting (optional for webhook)
export const ipWhitelist = (req, res, next) => {
  const allowedIPs = process.env.RAZORPAY_WEBHOOK_IPS?.split(",") || [];
  const clientIP = req.ip || req.connection.remoteAddress;

  if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  }

  next();
};

// ✅ Sanitize Input
export const sanitizeInput = (req, res, next) => {
  const dangerous = /<script|javascript:|onerror=/gi;

  const check = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === "string" && dangerous.test(obj[key])) {
        return true;
      }
    }
    return false;
  };

  if (check(req.body) || check(req.query)) {
    return res.status(400).json({
      success: false,
      message: "Invalid input detected",
    });
  }

  next();
};
