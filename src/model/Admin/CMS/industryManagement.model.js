import mongoose from "mongoose";

const productTagSchema = new mongoose.Schema(
  {
    parent: {
      type: String,
      required: true,
    },
    tag: {
      type: [String],
      required: true,
    },
  },
  { _id: false }
);

const industryManagement = new mongoose.Schema(
  {
    industry: {
      type: String,
      require: true,
    },
    categories: {
      type: [String],
      require: true,
    },
    productTags: {
      type: [productTagSchema],
      default: [],
    },
    serviceTags: {
      type: [productTagSchema],
      default: [],
    },
    uuid: {
      type: String,
      require: true,
    }
  },
  {
    timestamps: true,
  }
);

export const IndustryManagement = mongoose.model(
  "IndustryManagement",
  industryManagement
);
