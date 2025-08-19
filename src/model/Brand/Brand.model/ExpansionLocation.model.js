import mongoose from "mongoose";

const ExpansionLocationDataSchema = new mongoose.Schema(
  {
  brandOwnerId: {
          type: String,
          unique: true,
          ref: 'BrandDetails',
          required: true
  },
  expansionLocationData:{ 
    currentOutletLocations: {
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
        locations: [
          {
            _id: false,
            country: String,
            states: [
              {
                _id: false,
                state: String,
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
            states: String,
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
        locations: [
          {
            _id: false,
            country: String,
            states: [
              {
                _id: false,
                state: String,
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