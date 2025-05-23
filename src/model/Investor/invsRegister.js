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
    match: [/^\+91\d{10}$/, 'Please enter a valid mobile number with country code ']
  },
  whatsappNumber: {
    type: String,
    match: [/^\+91\d{10}$/, 'Please enter a valid WhatsApp number with country code']
  },
  address: {
    type: String,
    required: false
  },
  pincode: {
    type: String,
    required:  false
  }, 
  country : {
     type: String,
     required :  false
  },
  state: {
    type: String,
    required:  false
  }, 
  city: {
    type: String,
    required:  false
  },
occupation: {
  type: String,
  required:  false,
  enum: [ "Student", "Salaried Professional", "Bussiness Owner / Self-Employed","Retired","Freelancer/ Consultant","Homemaker","Investor","Other"] // Add valid options
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
    required:  false
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
