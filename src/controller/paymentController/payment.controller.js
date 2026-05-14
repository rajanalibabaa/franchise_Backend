// controllers/payment/paymentController.js
import razorpay from "../../config/paymentHandle.js";
import Payment from "../../model/LeadPackage/paymentModel.js";
import crypto from "crypto";
import { GSTCalculator } from "./gstCalculator.js";
// import { generateInvoice } from "../../utils/paymentsHandle/invoiceGenerator.js";
import { encryptSensitiveData } from "../../utils/paymentsHandle/encryption.js";

// ==============================
// ✅ CREATE PAYMENT WITH GST
// ==============================
export const createPayment = async (req, res) => {
  try {
    const {
      brandOwnerId,
      baseAmount,
      packageName,
      email,
      phone,
      name,
      brandID,
      gstNumber,
      pan,
      billingState = 'TN', // Default Tamil Nadu
      companyState = 'TN', // Default Tamil Nadu
    } = req.body;

    // Validation
    if (!baseAmount || !brandOwnerId || !packageName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: baseAmount, brandOwnerId, packageName",
      });
    }

    if (baseAmount < 1 || baseAmount > 10000000) {
      return res.status(400).json({
        success: false,
        message: "Amount must be between ₹1 and ₹1,00,00,000",
      });
    }

    // ✅ GST Calculation
    const gstBreakdown = GSTCalculator.calculate(
      baseAmount,
      companyState,
      billingState
    );

    const finalAmount = gstBreakdown.finalAmount;

    // ✅ Processing Fee (optional - 2%)
    const processingFee = parseFloat((finalAmount * 0.02).toFixed(2));
    const totalAmount = finalAmount + processingFee;

    // ✅ Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // paise
      currency: "INR",
      receipt: `rcpt_${brandOwnerId}_${Date.now()}`,
      notes: {
        packageName,
        brandOwnerId,
        gstNumber: gstNumber || 'N/A',
      },
    });

    // ✅ Generate Invoice Number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // ✅ Create Payment Record
    const payment = await Payment.create({
      brandOwnerId,
      packageName,
      orderId: order.id,
      amount: totalAmount,
      currency: "INR",
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

      breakdown: {
        baseAmount: gstBreakdown.baseAmount,
        tax: gstBreakdown.totalGST,
        cgst: gstBreakdown.cgst,
        sgst: gstBreakdown.sgst,
        igst: gstBreakdown.igst,
        processingFee,
        discount: 0,
        finalAmount: totalAmount,
      },

      invoice: {
        invoiceNumber,
        generatedAt: new Date(),
      },

      compliance: {
        gstNumber: gstNumber || null,
        pan: pan || null,
        kycVerified: !!gstNumber,
      },

      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
        billingState,
        companyState,
      },
    });

    // ✅ Encrypt Sensitive Data
    if (gstNumber || pan) {
      payment.encryptedData = encryptSensitiveData({
        gst: gstNumber,
        pan,
      });
    }

    await payment.save();

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      data: {
        orderId: order.id,
        key: process.env.RAZORPAY_KEY_ID,
        currency: order.currency,
        amount: order.amount, // in paise
        amountInRupees: totalAmount,
        paymentId: payment._id,
        invoiceNumber,
        gstBreakdown,
        breakdown: payment.breakdown,
      },
    });

  } catch (err) {
    console.error("❌ CREATE PAYMENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Payment creation failed",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
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
      return res.status(400).json({ 
        success: false, 
        message: "Missing required parameters" 
      });
    }

    // ✅ Signature Verification
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        {
          status: "failed",
          paymentSuccess: false,
          failureReason: {
            code: "SIGNATURE_MISMATCH",
            description: "Invalid payment signature",
            source: "verification",
            step: "signature_check",
          },
        }
      );

      return res.status(400).json({ 
        success: false, 
        message: "Payment verification failed - Invalid signature" 
      });
    }

    // ✅ Fetch Payment Details from Razorpay
    const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

    // ✅ Update Payment in DB
    const payment = await Payment.findOneAndUpdate(
      { 
        orderId: razorpay_order_id, 
        status: { $in: ["initiated", "pending", "authorized"] } 
      },
      {
        status: "captured",
        paymentSuccess: true,
        paymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        
        paymentMethod: {
          type: razorpayPayment.method,
          provider: razorpayPayment.bank || razorpayPayment.wallet || null,
          last4: razorpayPayment.card?.last4 || null,
          network: razorpayPayment.card?.network || null,
        },

        settlement: {
          settled: false,
        },
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found or already processed",
      });
    }

    // ✅ Generate Invoice PDF
    // try {
    //   const invoiceUrl = await generateInvoice(payment);
    //   payment.invoice.invoiceUrl = invoiceUrl;
    //   await payment.save();
    // } catch (invoiceErr) {
    //   console.error("Invoice generation failed:", invoiceErr);
    //   // Don't fail the payment verification
    // }

    res.json({
      success: true,
      message: "Payment verified successfully",
      data: {
        paymentId: payment._id,
        orderId: payment.orderId,
        amount: payment.amount,
        status: payment.status,
        invoiceNumber: payment.invoice.invoiceNumber,
        invoiceUrl: payment.invoice.invoiceUrl,
      },
    });

  } catch (err) {
    console.error("❌ VERIFY PAYMENT ERROR:", err);
    res.status(500).json({ 
      success: false, 
      message: "Payment verification failed",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// ==============================
// ✅ WEBHOOK HANDLER
// ==============================
export const webhookHandler = async (req, res) => {
  const startTime = Date.now();

  try {
    const signature = req.headers["x-razorpay-signature"];

    if (!signature) {
      console.error("❌ Missing webhook signature");
      return res.status(400).json({ error: "Missing signature" });
    }

    // ✅ Verify Webhook Signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("❌ Invalid webhook signature");
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = JSON.parse(req.rawBody);
    const eventId = event.id;
    const eventType = event.event;
    const paymentData = event.payload?.payment?.entity;

    if (!paymentData) {
      return res.json({ status: "ignored - no payment data" });
    }

    // ✅ Idempotency Check
    const existingEvent = await Payment.findOne({
      "webhookEvents.eventId": eventId,
    });

    if (existingEvent) {
      console.log(`ℹ️ Duplicate webhook event: ${eventId}`);
      return res.json({ status: "duplicate_event" });
    }

    // ✅ Find Payment
    const payment = await Payment.findOne({
      orderId: paymentData.order_id,
      isDeleted: false,
    });

    if (!payment) {
      console.warn(`⚠️ Payment not found for order: ${paymentData.order_id}`);
      return res.json({ status: "not_found" });
    }

    // ✅ Amount Validation (Critical Security Check)
    if (payment.amount * 100 !== paymentData.amount) {
      console.error("❌ AMOUNT MISMATCH DETECTED", {
        dbAmount: payment.amount,
        razorpayAmount: paymentData.amount / 100,
        orderId: paymentData.order_id,
      });

      payment.status = "failed";
      payment.failureReason = {
        code: "AMOUNT_MISMATCH",
        description: "Amount validation failed",
        source: "webhook",
        step: "validation",
      };

      await payment.save();

      return res.status(400).json({ error: "Amount mismatch - potential fraud" });
    }

    // ✅ Handle Different Event Types
    switch (eventType) {
      case "payment.captured":
        if (payment.status !== "captured") {
          payment.status = "captured";
          payment.paymentSuccess = true;
          payment.paymentId = paymentData.id;
          
          payment.paymentMethod = {
            type: paymentData.method,
            provider: paymentData.bank || paymentData.wallet || null,
            last4: paymentData.card?.last4 || null,
            network: paymentData.card?.network || null,
          };

          // Generate invoice
          try {
            const invoiceUrl = await generateInvoice(payment);
            payment.invoice.invoiceUrl = invoiceUrl;
          } catch (err) {
            console.error("Invoice generation failed in webhook:", err);
          }
        }
        break;

      case "payment.failed":
        payment.status = "failed";
        payment.paymentSuccess = false;
        payment.failureReason = {
          code: paymentData.error_code,
          description: paymentData.error_description,
          source: paymentData.error_source || "razorpay",
          step: paymentData.error_step || "payment",
        };
        break;

      case "payment.authorized":
        payment.status = "authorized";
        break;

      case "refund.created":
        payment.status = "refund_initiated";
        payment.refund = {
          refundId: event.payload.refund.entity.id,
          amount: event.payload.refund.entity.amount / 100,
          status: "initiated",
          processedAt: new Date(),
        };
        break;

      case "refund.processed":
        payment.status = "refunded";
        if (payment.refund) {
          payment.refund.status = "processed";
        }
        break;

      default:
        console.log(`ℹ️ Unhandled webhook event: ${eventType}`);
    }

    // ✅ Save Webhook Event
    payment.webhookEvents.push({
      event: eventType,
      eventId: eventId,
      receivedAt: new Date(),
      processed: true,
      payload: event, // Store full payload for debugging
    });

    payment.lastAttemptAt = new Date();
    payment.attemptCount += 1;

    await payment.save();

    console.log(`✅ Webhook processed: ${eventType} in ${Date.now() - startTime}ms`);

    res.json({ status: "processed", eventId });

  } catch (err) {
    console.error("🔥 WEBHOOK ERROR:", err);

    // Return 200 to prevent Razorpay retries
    res.status(200).json({ 
      status: "error_logged",
      message: err.message,
    });
  }
};

// ==============================
// ✅ GET PAYMENT HISTORY
// ==============================
export const getPaymentHistory = async (req, res) => {
  try {
    const { brandOwnerId, status, startDate, endDate, page = 1, limit = 20 } = req.query;

    if (!brandOwnerId) {
      return res.status(400).json({
        success: false,
        message: "brandOwnerId is required",
      });
    }

    const query = {
      brandOwnerId,
      isDeleted: false,
    };

    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .select('-razorpaySignature -encryptedData -webhookEvents.payload')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      
      Payment.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });

  } catch (err) {
    console.error("❌ GET PAYMENT HISTORY ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
    });
  }
};

// ==============================
// ✅ GET PAYMENT DETAILS
// ==============================
export const getPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { brandOwnerId } = req.query;

    const payment = await Payment.findOne({
      _id: id,
      brandOwnerId,
      isDeleted: false,
    })
      .select('-razorpaySignature -encryptedData')
      .lean();

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.json({
      success: true,
      data: payment,
    });

  } catch (err) {
    console.error("❌ GET PAYMENT DETAILS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment details",
    });
  }
};

// ==============================
// ✅ GET PAYMENT ANALYTICS
// ==============================
export const getPaymentAnalytics = async (req, res) => {
  try {
    const { brandOwnerId, startDate, endDate } = req.query;

    if (!brandOwnerId) {
      return res.status(400).json({
        success: false,
        message: "brandOwnerId is required",
      });
    }

    const matchQuery = {
      brandOwnerId,
      isDeleted: false,
    };

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const analytics = await Payment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          avgAmount: { $avg: "$amount" },
        },
      },
    ]);

    const summary = {
      total: 0,
      successful: 0,
      failed: 0,
      pending: 0,
      totalRevenue: 0,
      totalGST: 0,
    };

    analytics.forEach((item) => {
      summary.total += item.count;
      
      if (item._id === "captured") {
        summary.successful = item.count;
        summary.totalRevenue = item.totalAmount;
      } else if (item._id === "failed") {
        summary.failed = item.count;
      } else if (["initiated", "pending", "authorized"].includes(item._id)) {
        summary.pending += item.count;
      }
    });

    // Calculate total GST collected
    const gstData = await Payment.aggregate([
      { $match: { ...matchQuery, status: "captured" } },
      {
        $group: {
          _id: null,
          totalGST: { $sum: "$breakdown.tax" },
          totalCGST: { $sum: "$breakdown.cgst" },
          totalSGST: { $sum: "$breakdown.sgst" },
          totalIGST: { $sum: "$breakdown.igst" },
        },
      },
    ]);

    if (gstData.length > 0) {
      summary.totalGST = gstData[0].totalGST;
      summary.gstBreakdown = {
        cgst: gstData[0].totalCGST,
        sgst: gstData[0].totalSGST,
        igst: gstData[0].totalIGST,
      };
    }

    res.json({
      success: true,
      data: {
        summary,
        breakdown: analytics,
      },
    });

  } catch (err) {
    console.error("❌ GET ANALYTICS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};

// ==============================
// ✅ INITIATE REFUND
// ==============================
export const initiateRefund = async (req, res) => {
  try {
    const { paymentId, amount, reason, processedBy } = req.body;

    const payment = await Payment.findById(paymentId);

    if (!payment || payment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: "Payment not eligible for refund",
      });
    }

    if (amount > payment.amount) {
      return res.status(400).json({
        success: false,
        message: "Refund amount exceeds payment amount",
      });
    }

    // Create Razorpay refund
    const refund = await razorpay.payments.refund(payment.paymentId, {
      amount: Math.round(amount * 100), // paise
      notes: { reason },
    });

    payment.status = amount === payment.amount ? "refund_initiated" : "partial_refund";
    payment.refund = {
      refundId: refund.id,
      amount,
      status: "initiated",
      reason,
      processedAt: new Date(),
      processedBy,
    };

    await payment.save();

    res.json({
      success: true,
      message: "Refund initiated successfully",
      data: {
        refundId: refund.id,
        amount,
        status: payment.status,
      },
    });

  } catch (err) {
    console.error("❌ REFUND ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Refund initiation failed",
      error: err.message,
    });
  }
};

// ==============================
// ✅ SOFT DELETE PAYMENT
// ==============================
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { deletedBy } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy,
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.json({
      success: true,
      message: "Payment deleted successfully",
    });

  } catch (err) {
    console.error("❌ DELETE PAYMENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete payment",
    });
  }
};

// ==============================
// ✅ DOWNLOAD INVOICE
// ==============================
export const downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);

    if (!payment || !payment.invoice.invoiceUrl) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // If invoice URL exists, redirect to it
    // Or regenerate PDF and send as download
    // const invoiceUrl = await generateInvoice(payment);

    res.json({
      success: true,
      data: {
        invoiceUrl,
        invoiceNumber: payment.invoice.invoiceNumber,
      },
    });

  } catch (err) {
    console.error("❌ DOWNLOAD INVOICE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to download invoice",
    });
  }
};