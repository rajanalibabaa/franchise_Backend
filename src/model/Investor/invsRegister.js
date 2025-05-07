import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";

const invsRegisterSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      unique: true,
      default: uuid,
    },
    // Personal Info
    firstName: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true },
    whatsappNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },

    // Address Info
    address: { type: String, required: true },
    country: { type: String, required: true },
    pincode: { type: String, required: true },
    state: { type: String },
    district: { type: String },
    city: { type: String },

    // Investment Info
    category: {
      type: String,
      required: true,
    },
    investmentRange: {
      type: String,
      required: true,
    },
    // capital: { type: Number, required: true },
    occupation: { type: String , required: true},
    propertytype: {
      type: String,
      
      required: true,
    },
    lookingFor: { type: String , required: true},
    // ownProperty: { type: String, required: true },
  

    // createdAt: {
    //   type: Date,
    //   default: Date.now,
    // },

    // refreshToken: { type: String, select: true }
  },
  {
    timestamps: true,
  }
);

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
