// import mongoose from "mongoose";

// const tagSchema = new mongoose.Schema(
//   {
//     tag: {
//       type: String,
//       required: true,
//     },
//     id: {
//       type: String,
//       required: true,
//     },
//   },
//   { _id: false },
// );
// const productTagSchema = new mongoose.Schema(
//   {
//     parent: {
//       type: String,
//       required: true,
//     },
//     tags: {
//       type: [tagSchema],
//       required: true,
//       default: [],
//     },
//     id: {
//       type: String,
//       required: true,
//     },
//   },
//   { _id: false },
// );
// const categoriesSchema = new mongoose.Schema(
//   {
//     category: {
//       type: String,
//       required: true,
//     },
//     id: {
//       type: String,
//       required: true,
//     },
//   },
//   { _id: false },
// );

// const industryManagement = new mongoose.Schema(
//   {
//     industry: {
//       type: String,
//       require: true,
//     },
//     categories: {
//       type: [categoriesSchema],
//       require: true,
//     },
//     productTags: {
//       type: [productTagSchema],
//       default: [],
//     },
//     serviceTags: {
//       type: [productTagSchema],
//       default: [],
//     },
//     uuid: {
//       type: String,
//       require: true,
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// export const IndustryManagement = mongoose.model(
//   "IndustryManagement",
//   industryManagement,
// );


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


const industrySchema = new mongoose.Schema(
  {
    industry: String,
    categories: [categoriesSchema],
    productTags: [productTagSchema],
    serviceTags: [productTagSchema],
    uuid: String,
  },
  { _id: false }
);

const headingSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    industries: {
      type: [industrySchema],
      default: [],
    },
  },
  { _id: false }
);

const industryManagementSchema = new mongoose.Schema(
  {
    headings: {
      type: [headingSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const IndustryManagement = mongoose.model(
  "IndustryManagementcms",
  industryManagementSchema
);