import mongoose from "mongoose";
import jwt from "jsonwebtoken";


const invsRegisterSchema = new mongoose.Schema(
  {
    firstName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  mobileNumber: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  whatsappNumber: {
    type: String,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit WhatsApp number']
  },
  address: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  country : {
     type: String,
     required : true
  },
  state: {
    type: String,
    required: true
  }, 
  city: {
    type: String,
    required: true
  },
occupation: {
  type: String,
  required: true,
  enum: ["Business", "Professional", "Retired", "Student", "Other"] // Add valid options
},
specifyOccupation: {
  type: String,
  required: function() {
    return this.occupation === 'Other';
  },
  trim: true
},
  category: {
    type: String,
    enum: [ ],
    required: true
  },
  investmentRange: {
    type: String,
    required: true
  },
  investmentAmount: {
    type: String,
    required: true
  },
  propertyType: {
    type: String,
    required: true
  },
  propertySize: {
    type: String,
    required: true
  }, 
  preferredState: {
    type: String,
    required: true
  },
  preferredCity: {
    type: String,
    required: true
  },
   uuid: {
    type: String,
    unique: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

invsRegisterSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

invsRegisterSchema.methods.generateRefreshToken = async function () {
  try {
    if (
      !process.env.REFRESH_TOKEN_SECRET ||
      !process.env.REFRESH_TOKEN_EXPIRY
    ) {
      throw new Error(
        "Missing REFRESH_TOKEN_SECRET or REFRESH_TOKEN_EXPIRY in environment variables."
      );
    }

    const refreshToken = jwt.sign(
      {
        _id: this._id.toString(),
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );

    this.refreshToken = refreshToken;
    await this.save();

    return refreshToken;
  } catch (error) {
    console.error("Error generating refresh token:", error);
    throw new Error("Failed to generate refresh token");
  }
};

export const InvsRegister = mongoose.model("InvsRegister", invsRegisterSchema);
