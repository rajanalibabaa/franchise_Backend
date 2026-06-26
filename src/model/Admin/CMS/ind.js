import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    tag: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);
const productTagSchema = new mongoose.Schema(
  {
    parent: {
      type: String,
      required: true,
    },
    tags: {
      type: [tagSchema],
      required: true,
      default: [],
    },
    id: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);
const categoriesSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const industryManagement = new mongoose.Schema(
  {
    industry: {
      type: String,
      require: true,
    },
    categories: {
      type: [categoriesSchema],
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
    },
  },    
  {
    timestamps: true,
  },
);

export const IndustryManagement = mongoose.model(
  "IndustryManagement",
  industryManagement,           
);

export const OldIndustryModel = IndustryManagement;