import mongoose from "mongoose";

const districtContactSchema = new mongoose.Schema(
  {
    district: {
      type: String,
      required: true,
    },

    email: String,
    mobileNumber: String,
    whatsappNumber: String,
  },
  { _id: false }
);

const stateContactSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      required: true,
    },

    email: String,
    mobileNumber: String,
    whatsappNumber: String,

    districts: [districtContactSchema],
  },
  { _id: false }
);

const brandContactMappingSchema =
  new mongoose.Schema({
    brandOwnerId: {
      type: String,
      unique: true,
      required: true,
    },

    brandName: String,

    states: [stateContactSchema],
  });

export default mongoose.model(
  "BrandContactMapping",
  brandContactMappingSchema
);