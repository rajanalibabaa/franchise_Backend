import mongoose from "mongoose";
import uuid from "../../utils/uuid.js";

const PackageDetailsSchema = new mongoose.Schema({
  packageName: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  totalMonths: {
    type: Number,
    required: true,
    min: 1,
  },
  perMonthLead: {
    type: Number,
    required: true,
    min: 0,
  },
  totalLeads: {
    type: Number,
    required: true,
    min: 0,
  },
});

const ListingPackageSchema = new mongoose.Schema({
  periodMonths: { type: Number, required: true, min: 1 },
  amount: { type: Number, required: true, min: 0 },
});

const PaymentPackagesSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      unique: true,
      default: uuid,
    },

    // ⭐ DYNAMIC PACKAGE LIST
    packages: {
      type: [PackageDetailsSchema],
      required: true,
    },

    // ⭐ DYNAMIC LISTING PACKAGES
    listingPackages: {
      type: [ListingPackageSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model(
  "advertisePaymentPackages",
  PaymentPackagesSchema,
);
