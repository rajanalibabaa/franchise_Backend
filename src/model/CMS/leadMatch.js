import mongoose from "mongoose";

const leadMatchingRuleSchema = new mongoose.Schema(
  {
    rules: [
      {
        matchName: {
          type: String,
          enum: [
            "Single Match",
            "Two-Way Match",
            "Three-Way Match",
            "Four-Way Match",
            "Five-Way Match",
          ],
          required: true,
        },
        matchType: {
          type: String,
          required: true,
        },

        matchFields: [
          {
            type: String,
            required: true,
          },
        ],

        packagePlans: [
          {
            packageType: {
              type: String,
              enum: ["Lead", "Listing", "Free"],
              required: true,
            },

            priority: {
              type: Number,
              default: 0,
            },

            isActive: {
              type: Boolean,
              default: false,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("LeadMatchingRule", leadMatchingRuleSchema);
