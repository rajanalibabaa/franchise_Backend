import express from "express";
import rateLimit from "express-rate-limit";

import {
  createPayment,
  verifyPayment,
  webhookHandler,
  deletePayment,getPaymentHistory

} from "../../controller/paymentController/payment.controller.js";

import { verifyJWT} from "../../Middleware/Authentication/authMiddleware.js";
import { rawBodyParser } from "../../Middleware/rawBodyParser.js";

const router = express.Router();

// 🔐 Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

router.use(limiter);

// 💳 Create
router.post("/v1/payment/create", createPayment);

// 🔏 Verify
router.post("/v1/payment/verify",  verifyPayment);

// 🔔 Webhook
router.post("/v1/payment/webhook", rawBodyParser, webhookHandler);

// 🗑️ Soft Delete
router.delete("/v1/payment/:id", deletePayment);

// 🕒 Get Payment History
router.get("/v1/payment/history", getPaymentHistory);

export default router;