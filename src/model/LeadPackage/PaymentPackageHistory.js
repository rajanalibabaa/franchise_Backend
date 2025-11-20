const PaymentPackageHistorySchema = new mongoose.Schema({
    
    uuid: {
      type: String,
      unique: true, 
    },
    brandName: {
      type: String,
    },
    paymentPackage: [{
      packageType: {
        type: String,
        required: true,
      },
      totalAmount: {
        type: Number,
        // required: true,
        min: 0,
      },
      totalMonths: {
        type: Number,
        // required: true,
        min: 1,
      },
      perMonthLead: {
        type: Number,
        // required: true,
        min: 0,
      },
      totalLeads: {
        type: Number,
        // required: true,
        min: 0,
      },
      isActive: {
        type: Boolean,
        default: false,
      },
      packageStartTime: { type: Date, default: Date.now },
      packageEndTime: { type: Date, default: Date.now },
      timestamp: { type: Date, default: Date.now }
    }],
  },

);

export const PaymentPackageHistory = mongoose.model("PaymentPackageHistory", PaymentPackageHistorySchema);
    