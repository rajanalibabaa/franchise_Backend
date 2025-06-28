import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// Preference Schema
const PreferenceSchema = new mongoose.Schema({
  category: [
    {
      main: { type: String },
      sub: { type: String },
      child: { type: String },
      _id: false
    }
  ],
  investmentRange: {
    type: String,
    required: true
  },
  investmentAmount: {
    type: String
  },
  locationType: {
    type: String,
    enum: ["domestic", "international"],
    required: true
  },
  preferredCountry: {
    type: String
  },
  preferredState: {
    type: String,
    required: true
  },
  preferredDistrict: {
    type: String,
    required: true
  },
  preferredCity: {
    type: String,
    required: true
  },
  propertyPreferred: [
    {
      propertyType: {
        type: String,
        trim: true
      },
      propertySize: {
        type: String,
        required: function () {
          return this.propertyType === "Own Property";
        }
      },
      propertyCountry: { type: String },
      propertyState: { type: String },
      propertyCity: { type: String },
      _id: false
    }
  ]
});

// Investor Registration Schema
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
      match: [/^\+91\d{10}$/, "Please enter a valid mobile number with country code"]
    },
    whatsappNumber: {
      type: String,
      match: [/^\+91\d{10}$/, "Please enter a valid WhatsApp number with country code"]
    },
    address: String,
    pincode: String,
    country: String,
    state: String,
    city: String,
    occupation: {
      type: String,
      enum: [
        "Student",
        "Salaried Professional",
        "Business Owner/ Self-Employed",
        "Retired",
        "Freelancer/ Consultant",
        "Homemaker",
        "Investor",
        "Other"
      ]
    },
    specifyOccupation: {
      type: String,
      required: function () {
        return this.occupation === "Other";
      },
      trim: true
    },
    preferences: [PreferenceSchema],
    uuid: {
      type: String,
      unique: true
    },
    profileImage: {
      type: String
    },
    inveterID: {
      type: String
    },
    refreshToken: {
      type: String
    },
    oldData: [
      {
        firstName: String,
        email: String,
        mobileNumber: String,
        whatsappNumber: String,
        address: String,
        pincode: String,
        country: String,
        state: String,
        city: String,
        occupation: String,
        specifyOccupation: String,
        preferences: [PreferenceSchema],
        createdAt: String,
        profileImage: String,
        _id: false
      }
    ]
  },
  {
    timestamps: true
  }
);

// Access Token Method
invsRegisterSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};

// Refresh Token Method
invsRegisterSchema.methods.generateRefreshToken = async function () {
  try {
    if (!process.env.REFRESH_TOKEN_SECRET || !process.env.REFRESH_TOKEN_EXPIRY) {
      throw new Error("Missing REFRESH_TOKEN_SECRET or REFRESH_TOKEN_EXPIRY in environment variables.");
    }

    const refreshToken = jwt.sign(
      { _id: this._id.toString() },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
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
