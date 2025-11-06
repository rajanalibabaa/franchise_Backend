import mongoose from "mongoose";
import uuid from "../../utils/uuid.js";

// Sub-schema for package details
const PackageDetailsSchema = new mongoose.Schema({
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalMonths: {
    type: Number,
    required: true,
    min: 1
  },
  perMonthLead: {
    type: Number,
    required: true,
    min: 0
  },
  totalLeads: {
    type: Number,
    required: true,
    min: 0
  }
  
});

// Sub-schema for listing packages
const ListingPackageSchema = new mongoose.Schema({
  periodMonths: {
    type: Number,
    required: true,
    min: 1
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  }
});

// Main Payment Packages Schema
const PaymentPackagesSchema = new mongoose.Schema({
   uuid: {
     type: String,
     unique: true,
     default: uuid
   },
  free: {
    type: PackageDetailsSchema,
    required: true
  },
  silver: {
    type: PackageDetailsSchema,
    required: true
  },
  gold: {
    type: PackageDetailsSchema,
    required: true
  },
  platinum: {
    type: PackageDetailsSchema,
    required: true
  },
  exclusive: {
    type: PackageDetailsSchema,
    required: true
  },
  listingPackages: {
    type: [ListingPackageSchema],
    required: true
  }
}, {
  timestamps: true
});

const PaymentPackages = mongoose.model('advertisePaymentPackages', PaymentPackagesSchema);

export default PaymentPackages;
