import mongoose from "mongoose";

const favoriteBrandsInvestorSchema = new mongoose.Schema(
  {
    InvestorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InvsRegister",
      required: true,
    },
    favoriteBrandByInvestor: [
      {
        brandID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "BrandListing",
          required: true,
        },
        addedAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  },
);

export const FavoriteBrandsLikedByInvestor = mongoose.model(
  "FavoriteBrandsLikedByInvestor",
  favoriteBrandsInvestorSchema,
);

const favoriteBrandLikedsSchema = new mongoose.Schema(
  {
    brandUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BrandListing",
      required: true,
    },
    favoriteBrandBybrand: [
      {
        brandID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "BrandListing",
          required: true,
        },
        addedAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

export const FavoriteBrandsLikedBybrand = mongoose.model(
  "FavoriteBrandsLikedBybrand",
  favoriteBrandLikedsSchema,
);

const favoriteBrandsSchema = new mongoose.Schema(
  {
    brandOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BrandListing",
      required: true,
    },
    favoriteBy: [
      {
        likeByInvestor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InvsRegister",
        },
        likeByBrand: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "BrandListing",
        },
        addedAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

export const FavoriteBrands = mongoose.model(
  "FavoriteBrands",
  favoriteBrandsSchema,
);
