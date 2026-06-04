import mongoose from "mongoose";

const leadMatchingRuleSchema = new mongoose.Schema(
  {
    rules: [
      {
      
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
