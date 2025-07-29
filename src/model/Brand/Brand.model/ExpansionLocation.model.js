import mongoose from "mongoose";

const ExpansionLocationDataSchema = new mongoose.Schema(
  {
    brandOwnerId: {
          type: String,
          unique: true,
          ref: 'BrandDetails',
          required: true
        },
   expansionLocationData:{ currentOutletLocations: {
      domestic: {
        locations: [
          {
            _id: false,
            state: String,
            districts: [
              {
                _id: false,
                district: String,
                cities: [String]
              }
            ]
          }
        ]
      },
      international: {
        country: [
          {
            _id: false,
            states: String,
            district: [
              {
                _id: false,
                district: String,
                cities: [String]
              }
            ]
          }
        ]
      }
    },
    expansionLocations: {
      domestic: {
        locations: [
          {
            _id: false,
            state: String,
            districts: [
              {
                _id: false,
                district: String,
                cities: [String]
              }
            ]
          }
        ]
      },
      international: {
        country: [
          {
            _id: false,
            states: String,
            district: [
              {
                _id: false,
                district: String,
                cities: [String]
              }
            ]
          }
        ]
      }
    },
    isInternationalExpansion: String,
  }
  },
  {
    timestamps: true
  }
);

export const BrandExpansionLocationData = mongoose.model("BrandExpansionLocationData", ExpansionLocationDataSchema);