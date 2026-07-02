// models/filterBlock.model.js
import mongoose from "mongoose";

const parentTagBlockSchema = new mongoose.Schema(
  {
    parent: {
      type: String,
      required: true,
      trim: true,
    },
    // Empty/omitted tags = block the ENTIRE parent + all tags under it.
    // Non-empty tags = only those specific tags are blocked.
    tags: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const filterBlockSchema = new mongoose.Schema(
  {
    // Optional: lets you keep multiple named configs, or just always use one "active" doc.
    name: {
      type: String,
      default: "default",
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    headings: {
      type: [String],
      default: [],
    },
    industries: {
      type: [String],
      default: [],
    },
    categories: {
      type: [String],
      default: [],
    },
    productTags: {
      type: [parentTagBlockSchema],
      default: [],
    },
    serviceTags: {
      type: [parentTagBlockSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const FilterBlock = mongoose.model("FilterBlock", filterBlockSchema);