import mongoose from "mongoose";

const EmailRecordSchema = new mongoose.Schema({
  investorEmail: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
});

const PremiumOfferRecordSchema = new mongoose.Schema({
  investorEmail: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
});

const MonthlyEmailStatsSchema = new mongoose.Schema({
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  emailCount: { type: Number, default: 0 },
  emailRecords: [{
    investorEmail: { type: String, required: true },
    sentAt: { type: Date, default: Date.now }
  }],
  premiumOfferCount: { type: Number, default: 0 },
  premiumOfferRecords: [{
    investorEmail: { type: String, required: true },
    sentAt: { type: Date, default: Date.now }
  }]
});

const BrandEmailCountSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.UUID,
      ref: "BrandListing",
      required: true,
    },
    brandName: { type: String, required: true },
    monthlyStats: [MonthlyEmailStatsSchema], // Array of monthly statistics
    currentMonth: { type: Number, required: true }, // Current active month
    currentYear: { type: Number, required: true }, // Current active year
  },
  { timestamps: true }
);

BrandEmailCountSchema.index({ brandId: 1 }, { unique: true });
BrandEmailCountSchema.index({ "monthlyStats.month": 1, "monthlyStats.year": 1 });

// Static methods for the schema
BrandEmailCountSchema.statics.getCurrentMonthStats = async function(brandId, brandName = '') {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  let brandEmailCount = await this.findOne({ brandId });

  if (!brandEmailCount) {
    // Create new record if doesn't exist
    brandEmailCount = new this({
      brandId,
      brandName,
      monthlyStats: [],
      currentMonth,
      currentYear
    });
    await brandEmailCount.save();
  }

  // Check if we need to start a new month
  if (brandEmailCount.currentMonth !== currentMonth || brandEmailCount.currentYear !== currentYear) {
    await this.startNewMonth(brandEmailCount);
    // Refresh the document
    brandEmailCount = await this.findOne({ brandId });
  }

  // Find current month stats
  let currentStats = brandEmailCount.monthlyStats.find(
    stats => stats.month === currentMonth && stats.year === currentYear
  );

  // If no current month stats found, create them
  if (!currentStats) {
    currentStats = {
      month: currentMonth,
      year: currentYear,
      emailCount: 0,
      emailRecords: [],
      premiumOfferCount: 0,
      premiumOfferRecords: []
    };
    brandEmailCount.monthlyStats.push(currentStats);
    brandEmailCount.currentMonth = currentMonth;
    brandEmailCount.currentYear = currentYear;
    await brandEmailCount.save();
  }

  return { brandEmailCount, currentStats };
};

BrandEmailCountSchema.statics.startNewMonth = async function(brandEmailCount) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Update current month/year
  brandEmailCount.currentMonth = currentMonth;
  brandEmailCount.currentYear = currentYear;

  // Check if we already have stats for this month
  const existingStats = brandEmailCount.monthlyStats.find(
    stats => stats.month === currentMonth && stats.year === currentYear
  );

  if (!existingStats) {
    brandEmailCount.monthlyStats.push({
      month: currentMonth,
      year: currentYear,
      emailCount: 0,
      emailRecords: [],
      premiumOfferCount: 0,
      premiumOfferRecords: []
    });
  }

  await brandEmailCount.save();
};

BrandEmailCountSchema.statics.recordEmail = async function(brandId, investorEmail, isPremiumOffer = false, brandName = '') {
  const { brandEmailCount, currentStats } = await this.getCurrentMonthStats(brandId, brandName);

  const emailRecord = {
    investorEmail,
    sentAt: new Date()
  };

  // Find the specific monthly stats in the array
  const monthlyStatsIndex = brandEmailCount.monthlyStats.findIndex(
    stats => stats.month === currentStats.month && stats.year === currentStats.year
  );

  if (monthlyStatsIndex === -1) {
    throw new Error('Monthly stats not found');
  }

  if (isPremiumOffer) {
    brandEmailCount.monthlyStats[monthlyStatsIndex].premiumOfferCount += 1;
    brandEmailCount.monthlyStats[monthlyStatsIndex].premiumOfferRecords.push(emailRecord);
  } else {
    brandEmailCount.monthlyStats[monthlyStatsIndex].emailCount += 1;
    brandEmailCount.monthlyStats[monthlyStatsIndex].emailRecords.push(emailRecord);
  }

  await brandEmailCount.save();
  return brandEmailCount.monthlyStats[monthlyStatsIndex];
};

BrandEmailCountSchema.statics.getMonthlyStats = async function(brandId, month, year) {
  const brandEmailCount = await this.findOne({ brandId });

  if (!brandEmailCount) {
    return null;
  }

  return brandEmailCount.monthlyStats.find(
    stats => stats.month === month && stats.year === year
  );
};

BrandEmailCountSchema.statics.getMonthlyHistory = async function(brandId) {
  const brandEmailCount = await this.findOne({ brandId });

  if (!brandEmailCount) {
    return [];
  }

  return brandEmailCount.monthlyStats.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
};

// Instance method to update brand name
BrandEmailCountSchema.methods.updateBrandName = function(brandName) {
  this.brandName = brandName;
  return this.save();
};

// Export the model
const BrandEmailCount = mongoose.model("BrandEmailCount", BrandEmailCountSchema);

// Export the service class that uses the static methods
export class EmailTrackingService {
  constructor() {}

  async getCurrentMonthStats(brandId, brandName = '') {
    return await BrandEmailCount.getCurrentMonthStats(brandId, brandName);
  }

  async recordEmail(brandId, investorEmail, isPremiumOffer = false, brandName = '') {
    return await BrandEmailCount.recordEmail(brandId, investorEmail, isPremiumOffer, brandName);
  }

  async getMonthlyStats(brandId, month, year) {
    return await BrandEmailCount.getMonthlyStats(brandId, month, year);
  }

  async getMonthlyHistory(brandId) {
    return await BrandEmailCount.getMonthlyHistory(brandId);
  }
}

export default BrandEmailCount;