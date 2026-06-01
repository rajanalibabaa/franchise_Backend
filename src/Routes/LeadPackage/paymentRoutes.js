import express from "express";
import rateLimit from "express-rate-limit";

import {
  createPayment,
  deletePayment,
  downloadInvoice,
  getPaymentAnalytics,
  getPaymentDetails,
  getPaymentHistory,
  verifyPayment,
  webhookHandler,
  initiateRefund,
  getallPaymentHistory,
} from "../../controller/paymentController/payment.controller.js";

import { verifyJWT } from "../../Middleware/Authentication/authMiddleware.js";
import { rawBodyParser } from "../../Middleware/rawBodyParser.js";
import {
  paymentRateLimiter,
  sanitizeInput,
} from "../../controller/paymentController/securityMiddalware.js";

const router = express.Router();

// ====================================
// 🔐 GLOBAL RATE LIMITER (Applied to all routes)
// ====================================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(globalLimiter);

// ====================================
// 📌 PUBLIC ROUTES (No Authentication)
// ====================================

/**
 * @route   POST /v1/payment/create
 * @desc    Create new payment order with GST calculation
 * @access  Public (with rate limiting)
 * @body    { brandOwnerId, baseAmount, packageName, email, phone, name, brandID, gstNumber, pan, billingState }
 */
router.post(
  "/v1/payment/create",
  paymentRateLimiter,
  sanitizeInput,
  createPayment
);

/**
 * @route   POST /v1/payment/verify
 * @desc    Verify Razorpay payment signature
 * @access  Public
 * @body    { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
router.post(
  "/v1/payment/verify",
  sanitizeInput,
  verifyPayment
);

/**
 * @route   POST /v1/payment/webhook
 * @desc    Handle Razorpay webhook events
 * @access  Public (Razorpay servers only)
 * @headers x-razorpay-signature
 */
router.post(
  "/v1/payment/webhook",
  rawBodyParser,
  webhookHandler
);

// ====================================
// 🔒 PROTECTED ROUTES (Authentication Required)
// ====================================


router.get(
  "/v1/payment/allpayment/history",
  // verifyJWT,
  getallPaymentHistory
);
/**
 * @route   GET /v1/payment/history
 * @desc    Get paginated payment history for a brand owner
 * @access  Private
 * @query   { brandOwnerId, status, startDate, endDate, page, limit }
 */
router.get(
  "/v1/payment/history",
  // verifyJWT,
  getPaymentHistory
);

/**
 * @route   GET /v1/payment/details/:id
 * @desc    Get detailed information of a specific payment
 * @access  Private
 * @params  id (Payment MongoDB _id)
 * @query   { brandOwnerId }
 */
router.get(
  "/v1/payment/details/:id",
  verifyJWT,
  getPaymentDetails
);

/**
 * @route   GET /v1/payment/analytics
 * @desc    Get payment analytics and statistics
 * @access  Private
 * @query   { brandOwnerId, startDate, endDate }
 */
router.get(
  "/v1/payment/analytics",
  verifyJWT,
  getPaymentAnalytics
);

/**
 * @route   GET /v1/payment/invoice/:id/download
 * @desc    Download invoice PDF for a payment
 * @access  Private
 * @params  id (Payment MongoDB _id)
 */
router.get(
  "/v1/payment/invoice/:id/download",
  verifyJWT,
  downloadInvoice
);

/**
 * @route   POST /v1/payment/refund
 * @desc    Initiate refund for a payment
 * @access  Private (Admin only - add role check if needed)
 * @body    { paymentId, amount, reason, processedBy }
 */
router.post(
  "/v1/payment/refund",
  verifyJWT,
  sanitizeInput,
  initiateRefund
);

/**
 * @route   DELETE /v1/payment/:id
 * @desc    Soft delete a payment record
 * @access  Private (Admin only)
 * @params  id (Payment MongoDB _id)
 * @body    { deletedBy }
 */
router.delete(
  "/v1/payment/:id",
  verifyJWT,
  deletePayment
);

// ====================================
// 📊 HEALTH CHECK
// ====================================

/**
 * @route   GET /v1/payment/health
 * @desc    Check if payment service is running
 * @access  Public
 */
router.get("/v1/payment/health", (req, res) => {
  res.json({
    success: true,
    message: "Payment service is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

export default router;