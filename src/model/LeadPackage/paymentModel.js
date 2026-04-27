// model/LeadPackage/paymentModel.js
import mongoose from "mongoose";
import crypto from "crypto";

const paymentSchema = new mongoose.Schema(
  {
    // User & Plan Information

    brandOwnerId: {
      type: String,
      ref: "BrandDetails",
    },

    // Razorpay Identifiers
    orderId: {
      type: String,
      // required: true,
      unique: true,
      index: true,
    },
    paymentId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    paymentSuccess: {
      type: Boolean,
      // required: true,

      default: false,
    },
    razorpaySignature: String,
    packageName: {
      type: String,
      // required: true,
    },
    // Financial Details
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      enum: ["INR", "USD", "EUR", "GBP"],
    },

    // Tax & Fee Breakdown
    breakdown: {
      baseAmount: Number,
      tax: Number,
      processingFee: Number,
      discount: Number,
      finalAmount: Number,
    },

    // Payment Status Management
    status: {
      type: String,
      enum: [
        "initiated",
        "pending",
        "authorized",
        "captured",
        "failed",
        "refund_initiated",
        "refunded",
        "partial_refund",
        "cancelled",
      ],
      default: "initiated",
      index: true,
    },

    // Payment Method Details
    paymentMethod: {
      type: {
        type: String,
        enum: ["card", "netbanking", "upi", "wallet", "emi"],
      },
      provider: String,
      last4: String, // Last 4 digits of card
      network: String, // Visa, Mastercard, etc.
    },

    // Refund Information
    refund: {
      refundId: String,
      amount: Number,
      status: String,
      reason: String,
      processedAt: Date,
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },

    // Failure Information
    failureReason: {
      code: String,
      description: String,
      source: String, // gateway, internal, network
      step: String, // creation, authorization, capture
    },

    // Attempt Tracking
    attemptCount: {
      type: Number,
      default: 0,
    },
    lastAttemptAt: Date,

    // Metadata & Audit Trail
    metadata: {
      ipAddress: String,
      userAgent: String,
      deviceId: String,
      sessionId: String,
      sourceUrl: String,
    },

    // Invoice & Receipt
    invoice: {
      invoiceNumber: String,
      invoiceUrl: String,
      generatedAt: Date,
    },
    receiptUrl: String,

    // Webhook Events
    webhookEvents: [
      {
        event: String,
        eventId: String, // ✅ IMPORTANT
        receivedAt: Date,
        processed: Boolean,
        payload: mongoose.Schema.Types.Mixed,
      },
    ],

    // Security
    encryptedData: String, // For sensitive information
    checksum: String, // Data integrity verification

    // Settlement Information
    settlement: {
      settled: {
        type: Boolean,
        default: false,
      },
      settledAt: Date,
      settlementId: String,
      utr: String, // Unique Transaction Reference
    },

    // Compliance
    compliance: {
      gstNumber: String,
      pan: String,
      kycVerified: Boolean,
    },

    // Notes for internal use
    notes: {
      type: Map,
      of: String,
    },

    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for performance
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ "settlement.settled": 1, status: 1 });
paymentSchema.index({ "invoice.invoiceNumber": 1 }, { sparse: true });

// Virtual for payment age
paymentSchema.virtual("paymentAge").get(function () {
  return Date.now() - this.createdAt;
});

// Virtual for success status
paymentSchema.virtual("isSuccessful").get(function () {
  return this.status === "captured";
});

// Pre-save middleware for checksum
paymentSchema.pre("save", function (next) {
  if (this.isModified()) {
    const dataString = `${this.orderId}|${this.amount}|${this.userId}`;
    this.checksum = crypto
      .createHash("sha256")
      .update(dataString)
      .digest("hex");
  }
  next();
});

// Method to mask sensitive data for logging
paymentSchema.methods.getMaskedData = function () {
  const obj = this.toObject();
  if (obj.paymentMethod?.last4) {
    obj.paymentMethod.maskedNumber = `****${obj.paymentMethod.last4}`;
  }
  delete obj.razorpaySignature;
  delete obj.encryptedData;
  return obj;
};

// Static method to find pending payments older than X hours
paymentSchema.statics.findStalePendingPayments = function (hours = 24) {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({
    status: { $in: ["initiated", "pending"] },
    createdAt: { $lt: cutoffTime },
    isDeleted: false,
  });
};

// Static method for analytics
paymentSchema.statics.getPaymentStats = async function (
  userId,
  startDate,
  endDate,
) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate, $lte: endDate },
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);
};

export default mongoose.model("Payment", paymentSchema);
