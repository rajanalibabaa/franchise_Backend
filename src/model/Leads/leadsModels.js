// import mongoose from "mongoose";
// import { IndustryManagement} from "../Admin/CMS/industryManagement.model.js";

// const fields = {
//   uuid: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   fullName: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//   },
//   investorMobileNumber: {
//     type: String,
//   },
//   state: {
//     type: String,
//   },
//   district: {
//     type: String,
//   },
//   city: {
//     type: String,
//   },
//   investmentRange: {
//     type: String,
//   },
//   planToInvest: {
//     type: String,
//   },
//   readyToInvest: {
//     type: String,
//   },
//   brandId: {
//     type: String,
//     required: true,
//   },
//   brandName: {
//     type: String,
//   },
//   brandEmail: {
//     type: String,
//   },
//   brandMobileNumber: {
//     type: String,
//   },
//   brandLogo: {
//     type: String,
//   },
//   apply: {
//     applyBy: {
//       type: String,
//       enum: ["Investor", "Brand", "Other"],
//       default: "Other",
//     },
//     applyId: {
//       type: String,
//       default: "Other",
//     },
//   },
//   industry: {
//     type: String,
//   },
//   category: {
//     type: String,
//   },
//   subCategory: {
//     type: String,
//   },
//   status: {
//     type: String,
//     enum: [
//       "follow-up",
//       "deal completed",
//       "not interested",
//       "not contactable",
//       "wrong category",
//       "out of area",
//     ],
//   },
//   starredByBrand: {
//     type: Boolean,
//   },
//   starredByInvestor: {
//     type: Boolean,
//   },
//   enquiryVia: {
//     type: String,
//     enum: ["portal", "expo", "telecall"],
//     default: "portal",
//   },
//   noteByBrand: {
//     type: String,
//   },
//   noteByInvestor: {
//     type: String,
//   },
// };

// const BaseSchema = new mongoose.Schema(fields, {
//   timestamps: true,
// });

// export const AllInvestorLeadsenquiry = mongoose.model(
//   "AllInvestorLeadsenquiry",
//   BaseSchema
// );

// export const getIndustryModel = async (
//   industryName
// ) => {
//   const industry =
//     await IndustryManagement.findOne({
//       industry: industryName,
//     });

//   if (!industry) {
//     throw new Error(
//       `Industry not found: ${industryName}`
//     );
//   }

//   const collectionName = industry.industry
//     .replace(/[^a-zA-Z0-9]/g, "")
//     .replace(/\s+/g, "");

//   if (mongoose.models[collectionName]) {
//     return mongoose.models[collectionName];
//   }

//   return mongoose.model(collectionName, BaseSchema, collectionName);
// };


import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const InvestorEnquirySchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      unique: true,
      default: uuidv4,
    },

    investorId: {
      type: String,
      ref: "InstantApplyInvestor",
      // required: true,
    },

    investorName: {
      type: String,
      // required: true,
    },

    investorEmail: {
      type: String,
      // required: true,
    },

    investorPhone: {
      type: String,
      // required: true,
    },

    state: String,
    district: String,
    city: String,

    investmentRange: String,

    planToInvest: String,

    readyToInvest: String,

    industry: String,

    category: String,

    subCategory: String,

    childCategory: String,

    brandId: {
      type: String,
      // required: true,
    },
    brandName: String,
    brandsSent: [
      {
        brandId: String,
        brandName: String,
        brandEmail: String,
        emailSent: {
          type: Boolean,
          default: false,
        },
        emailSentAt: Date,
      },
    ],

    status: {
      type: String,
      enum: [
        "new",
        "follow-up",
        "deal completed",
        "not interested",
        "not contactable",
      ],
      default: "new",
    },

    notes: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "allInvestorEnquirydata",
  InvestorEnquirySchema
);
