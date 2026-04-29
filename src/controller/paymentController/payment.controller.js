import razorpay from "../../config/paymentHandle.js";
import Payment from "../../model/LeadPackage/paymentModel.js";
import crypto from "crypto";

// ==============================
// ✅ CREATE PAYMENT
// ==============================
export const createPayment = async (req, res) => {
  try {
    const {
      brandOwnerId,
      amount,
      packageName,
      email,
      phone,
      name,
      brandID,
    } = req.body;

    if (!amount || !brandOwnerId || !packageName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // ✅ Always create new Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    // ✅ Always create NEW DB record
    const payment = await Payment.create({
      brandOwnerId,
      packageName,
      orderId: order.id,
      amount,
      status: "initiated",
      paymentSuccess: false,
      attemptCount: 1,
      lastAttemptAt: new Date(),

      customer: {
        brandID,
        email,
        phone,
        name,
      },

      metadata: {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    return res.json({
      success: true,
      data: {
        orderId: order.id,
        key: process.env.RAZORPAY_KEY_ID,
        currency: order.currency,
        amount: order.amount,
        paymentId: payment._id,
      },
    });

  } catch (err) {
    console.error("CREATE PAYMENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// ✅ VERIFY PAYMENT
// ==============================
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing params" });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      await Payment.updateOne(
        { orderId: razorpay_order_id },
        { status: "failed", paymentSuccess: false }
      );

      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const payment = await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id, status: { $ne: "captured" } },
      {
        status: "captured",
        paymentSuccess: true,
        paymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Payment verified",
      data: payment,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// ✅ WEBHOOK
// ==============================
export const webhookHandler = async (req, res) => {
  const startTime = Date.now();

  try {
    const signature = req.headers["x-razorpay-signature"];

    if (!signature) {
      return res.status(400).json({ error: "Missing signature" });
    }

    // 🔐 VERIFY SIGNATURE
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.rawBody)
      .digest("hex");

    if (signature !== expected) {
      console.error("❌ Invalid webhook signature");
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = JSON.parse(req.rawBody);
    const eventId = event.id;
    const eventType = event.event;

    const paymentData = event.payload?.payment?.entity;

    if (!paymentData) {
      return res.json({ status: "ignored" });
    }

    // 🔁 IDEMPOTENCY CHECK
    const existingEvent = await Payment.findOne({
      "webhookEvents.eventId": eventId,
    });

    if (existingEvent) {
      return res.json({ status: "duplicate_event" });
    }

    // 🔍 FIND PAYMENT
    const payment = await Payment.findOne({
      orderId: paymentData.order_id,
      isDeleted: false,
    });

    if (!payment) {
      console.warn("⚠️ Payment not found:", paymentData.order_id);
      return res.json({ status: "not_found" });
    }

    // 🔒 AMOUNT VALIDATION (CRITICAL)
    if (payment.amount * 100 !== paymentData.amount) {
      console.error("❌ Amount mismatch", {
        dbAmount: payment.amount,
        razorpayAmount: paymentData.amount,
      });

      return res.status(400).json({ error: "Amount mismatch" });
    }

    // 🎯 HANDLE EVENTS
    switch (eventType) {
      case "payment.captured":
        payment.status = "captured";
        payment.paymentSuccess = true;
        payment.paymentId = paymentData.id;
        payment.paymentMethod = {
          type: paymentData.method,
          provider: paymentData.bank || paymentData.wallet || null,
          last4: paymentData.card?.last4 || null,
          network: paymentData.card?.network || null,
        };
        break;

      case "payment.failed":
        payment.status = "failed";
        payment.paymentSuccess = false;
        payment.failureReason = {
          code: paymentData.error_code,
          description: paymentData.error_description,
          source: paymentData.error_source,
          step: paymentData.error_step,
        };
        break;

      case "payment.authorized":
        payment.status = "authorized";
        break;

      default:
        console.log("ℹ️ Unhandled event:", eventType);
    }

    // 📦 SAVE WEBHOOK EVENT
    payment.webhookEvents.push({
      event: eventType,
      eventId: eventId,
      receivedAt: new Date(),
      processed: true,
      payload: event,
    });

    payment.lastAttemptAt = new Date();
    payment.attemptCount += 1;

    await payment.save();

    console.log(`✅ Webhook processed: ${eventType} (${Date.now() - startTime}ms)`);

    res.json({ status: "processed" });
  } catch (err) {
    console.error("🔥 Webhook Error:", err.message);

    // Razorpay retries if non-200 → so return 200 intentionally
    res.status(200).json({ status: "error_logged" });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const { brandOwnerId, userId } = req.query;

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    await Payment.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });

    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
