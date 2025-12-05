import mongoose from "mongoose";
import uuid from "../../../utils/uuid.js";

const productTagSchema = new mongoose.Schema(
  {
    parent: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      required: true,
      default:[]
    },
    id: {
      type: String,
      default: uuid(),
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
