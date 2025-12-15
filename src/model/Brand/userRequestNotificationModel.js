import mongoose from "mongoose";
import uuid from "../../utils/uuid.js";

const userRequestSchema = new mongoose.Schema({
  uuid: { type: String, default: uuid, unique: true },

  // Brand info
  brandId: { type: String, required: true },
  brandOriginalId: { type: String, required: true },
  brandName: { type: String, required: true },
  brandLogo: { type: String  },
  brandEmail: { type: String, required: true },
  mobileNumber: { type: String },
  whatsappNumber: { type: String },

  // Request type & message
  type: { type: String, required: true },
  message: { type: String },

  // Contact details (can store multiple contacts)
  contactDetails: [
    {
      emergencyContactName: { type: String },
      emergencyContactEmail: { type: String },
      emergencyContactPhone: { type: String }
    }
  ],

  // Status flags
  isActive: { type: Boolean, default: true },   // Active request
  isViewed: { type: Boolean, default: false }, // Admin/user has seen the request
  isOpened: { type: Boolean, default: false }, // User/admin has opened the message

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update updatedAt automatically
userRequestSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("BrandRequest", userRequestSchema);
