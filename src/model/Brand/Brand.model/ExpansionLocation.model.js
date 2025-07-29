import mongoose from "mongoose";

const ExpansionLocationDataSchema = new mongoose.Schema(
  {
    brandOwnerId: {
          type: mongoose.Schema.Types.ObjectId,
          unique: true,
          ref: 'BrandDetails',
          required: true
        },
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
    uuid: {
              type: String,
              default: uuid,
              unique: true,
              ref: 'BrandDetails',
            },
  },
  {
    timestamps: true
  }
);

export const ExpansionLocationData = mongoose.model("ExpansionLocationData", ExpansionLocationDataSchema);