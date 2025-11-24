import mongoose from "mongoose";

const BrandDetailsSchema = new mongoose.Schema(

  {
    uuid: {
      type: String,
      unique: true,
    },
    brandID: {
      type: String,
      unique: true,
    },
    brandDetails: {
      fullName: String,
      email: String,
      mobileNumber: String,
      whatsappNumber: String,
      companyName: String,
      brandName: String,
      tagLine: String,
      ceoName: String,
      ceoMobile: String,
      ceoEmail: String,
      officeEmail: String,
      officeMobile: String,
      headOfficeAddress: String,
      country: { type: String, default: "INDIA" },
      state: String,
      district: String,
      city: String,
      pincode: String,
      website: String,
      facebook: String,
      instagram: String,
      linkedin: String,
      gstNumber: String,
      pancardNumber: String,
      specialFreeLeadCount: {
        type: Number,
      },
      pause: {
        type: Boolean,
        default: false,
      },
      isApproved: {
        type: Boolean,
        default: false,
      },
      isBrandPause: {
        type: Boolean,
        default: false,
      },
      payment: {
        type: Boolean,
        default: false,
      },
      isFreeLeadPaused: {
        type: Boolean,
        default: false,
      },
      isPaidBrandLeadPaused: {
        type: Boolean,
        default: false,
      },
      paymentPackage: {
        packageType: {
          type: String,
          required: true,
          default:"free"
        },
        
        totalAmount: {
          type: Number,
          // required: true,
          min: 0,
        },
        totalMonths: {
          type: Number,
          // required: true,
          min: 1,
        },
        perMonthLead: {
          type: Number,
          // required: true,
          min: 0,
        },
        totalLeads: {
          type: Number,
          // required: true,
          min: 0,
        },
        isActive: {
          type: Boolean,
          default:false
        },
        packageUpdatedTime: { type: Date, default: Date.now },
        sentLeadsPercentage: {
          type: String,
          default:"0 %"
        }
      },
      listingPackages: {
        periodMonths: {
          type: Number,
          min: 1,
        },
        amount: {
          type: Number,
          min: 0,
        },
      },
    },
    active: {
      type: Boolean,
      default: false,
    },
    lastActive: {
      type: Date,
    },

    loginPlatform: {
      type: String,
    },
    newOtp: {
      type: String,
    },
    otpExpired: {
      type: Date,
    },
    userNewVerifyToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const BrandDetails = mongoose.model("BrandDetails", BrandDetailsSchema);
