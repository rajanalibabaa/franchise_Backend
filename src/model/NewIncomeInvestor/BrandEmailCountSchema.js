import mongoose from "mongoose";

// These schemas are commented out since we're defining the structure directly in MonthlyEmailStatsSchema
// const EmailRecordSchema = new mongoose.Schema({
//   investorEmail: { type: String, required: true },
//   sentAt: { type: Date, default: Date.now },
// });

// const PremiumOfferRecordSchema = new mongoose.Schema({
//   investorEmail: { type: String, required: true },
//   sentAt: { type: Date, default: Date.now },
// });

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
}, { timestamps: true }); // Each monthly entry has its own timestamps

const BrandEmailCountSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.UUID,
      ref: "BrandListing",
      required: true,
    },
    brandName: { type: String, required: true },
    monthlyStats: [MonthlyEmailStatsSchema], 
    // All monthly data is now consolidated in monthlyStats array
    // No scattered month/year fields at root level
  },
  { timestamps: true }
);

// Alternative schema definition (commented out) showing what was removed
// const BrandEmailCountSchema = new mongoose.Schema(
//   {
//     brandId: {
//       type: mongoose.Schema.Types.UUID,
//       ref: "BrandListing",
//       required: true,
//     },
//     brandName: { type: String, required: true },
//     monthlyStats: [MonthlyEmailStatsSchema], 
//     // REMOVED: currentMonth, currentYear - now handled within monthlyStats array
//     // REMOVED: emailCount, emailRecords - now handled within monthlyStats array
//     // REMOVED: premiumOfferCount, premiumOfferRecords - now handled within monthlyStats array
//   },
//   { timestamps: true }
// );

BrandEmailCountSchema.index({ brandId: 1 }, { unique: true });
BrandEmailCountSchema.index({ "monthlyStats.month": 1, "monthlyStats.year": 1 });

// Static methods for the schema
BrandEmailCountSchema.statics.getCurrentMonthStats = async function(brandId, brandName = '') {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; 
  const currentYear = currentDate.getFullYear();

  let brandEmailCount = await this.findOne({ brandId });

  if (!brandEmailCount) {
    // Create new record with current month stats
    brandEmailCount = new this({
      brandId,
      brandName,
      monthlyStats: [{
        month: currentMonth,
        year: currentYear,
        emailCount: 0,
        emailRecords: [],
        premiumOfferCount: 0,
        premiumOfferRecords: []
      }]
    });
    await brandEmailCount.save();
  }

  // Find or create current month stats
  let currentStats = brandEmailCount.monthlyStats.find(
    stats => stats.month === currentMonth && stats.year === currentYear
  );

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
    await brandEmailCount.save();
  }

  return { brandEmailCount, currentStats };
};

// FIXED: Removed duplicate recordEmail method - keeping only one
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

// REMOVED DUPLICATE: This was a duplicate of the above method
// BrandEmailCountSchema.statics.recordEmail = async function(brandId, investorEmail, isPremiumOffer = false, brandName = '') {
//   const { brandEmailCount, currentStats } = await this.getCurrentMonthStats(brandId, brandName);
//
//   const emailRecord = {
//     investorEmail,
//     sentAt: new Date()
//   };
//
//   // Find the specific monthly stats in the array
//   const monthlyStatsIndex = brandEmailCount.monthlyStats.findIndex(
//     stats => stats.month === currentStats.month && stats.year === currentStats.year
//   );
//
//   if (monthlyStatsIndex === -1) {
//     throw new Error('Monthly stats not found');
//   }
//
//   if (isPremiumOffer) {
//     brandEmailCount.monthlyStats[monthlyStatsIndex].premiumOfferCount += 1;
//     brandEmailCount.monthlyStats[monthlyStatsIndex].premiumOfferRecords.push(emailRecord);
//   } else {
//     brandEmailCount.monthlyStats[monthlyStatsIndex].emailCount += 1;
//     brandEmailCount.monthlyStats[monthlyStatsIndex].emailRecords.push(emailRecord);
//   }
//
//   await brandEmailCount.save();
//   return brandEmailCount.monthlyStats[monthlyStatsIndex];
// };

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

BrandEmailCountSchema.statics.getCurrentStats = async function(brandId) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  return await this.getMonthlyStats(brandId, currentMonth, currentYear);
};

// Instance method to update brand name
BrandEmailCountSchema.methods.updateBrandName = function(brandName) {
  this.brandName = brandName;
  return this.save();
};

// Instance method to get current month stats
BrandEmailCountSchema.methods.getCurrentStats = function() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  return this.monthlyStats.find(
    stats => stats.month === currentMonth && stats.year === currentYear
  );
};

// Instance method to get stats for specific month
BrandEmailCountSchema.methods.getStatsForMonth = function(month, year) {
  return this.monthlyStats.find(
    stats => stats.month === month && stats.year === year
  );
};

// Instance method to ensure current month exists
BrandEmailCountSchema.methods.ensureCurrentMonth = function() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const currentStats = this.getCurrentStats();
  if (!currentStats) {
    this.monthlyStats.push({
      month: currentMonth,
      year: currentYear,
      emailCount: 0,
      emailRecords: [],
      premiumOfferCount: 0,
      premiumOfferRecords: []
    });
  }
  return this.save();
};

// FIXED: Added the missing migrateToConsolidatedStructure method
BrandEmailCountSchema.statics.migrateToConsolidatedStructure = async function() {
  const brands = await this.find({});
  let migratedCount = 0;

  for (const brand of brands) {
    let needsMigration = false;
    
    // Check if this document has the old scattered structure
    const hasScatteredFields = brand.month !== undefined || 
                              brand.year !== undefined ||
                              brand.emailCount !== undefined ||
                              brand.premiumOfferCount !== undefined;

    if (hasScatteredFields) {
      const currentMonth = brand.month;
      const currentYear = brand.year;

      if (currentMonth && currentYear) {
        // Find or create monthly stats for the scattered data
        let existingStats = brand.monthlyStats.find(
          stats => stats.month === currentMonth && stats.year === currentYear
        );

        if (!existingStats) {
          // Create new monthly stats from scattered data
          brand.monthlyStats.push({
            month: currentMonth,
            year: currentYear,
            emailCount: brand.emailCount || 0,
            emailRecords: brand.emailRecords || [],
            premiumOfferCount: brand.premiumOfferCount || 0,
            premiumOfferRecords: brand.premiumOfferRecords || []
          });
        } else {
          // Merge scattered data into existing stats
          existingStats.emailCount = brand.emailCount || existingStats.emailCount;
          existingStats.premiumOfferCount = brand.premiumOfferCount || existingStats.premiumOfferCount;
          // Note: Records arrays are not merged to avoid duplicates
        }

        // Remove scattered fields
        brand.month = undefined;
        brand.year = undefined;
        brand.emailCount = undefined;
        brand.emailRecords = undefined;
        brand.premiumOfferCount = undefined;
        brand.premiumOfferRecords = undefined;

        needsMigration = true;
      }
    }

    if (needsMigration) {
      await brand.save();
      migratedCount++;
    }
  }

  return { migratedCount, totalProcessed: brands.length };
};

// Export the model
const BrandEmailCount = mongoose.model("BrandEmailCount", BrandEmailCountSchema);

// Data migration method to clean up existing documents (run-on-demand)
// Set environment variable RUN_EMAIL_MIGRATION=true to run migration once.
const migrateExistingData = async () => {
  try {
    const documents = await BrandEmailCount.find({});
    let migratedCount = 0;

    for (const doc of documents) {
      // Check if document has scattered data that needs migration
      if (doc.month && doc.year) {
        const existingMonthlyStat = doc.monthlyStats.find(
          stat => stat.month === doc.month && stat.year === doc.year
        );

        if (!existingMonthlyStat) {
          // Create new monthly stats entry from scattered data
          const newMonthlyStat = {
            month: doc.month,
            year: doc.year,
            emailCount: doc.emailCount || 0,
            emailRecords: doc.emailRecords || [],
            premiumOfferCount: doc.premiumOfferCount || 0,
            premiumOfferRecords: doc.premiumOfferRecords || [],
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
          };

          doc.monthlyStats.push(newMonthlyStat);

          // Remove scattered fields
          doc.month = undefined;
          doc.year = undefined;
          doc.emailCount = undefined;
          doc.emailRecords = undefined;
          doc.premiumOfferCount = undefined;
          doc.premiumOfferRecords = undefined;

          await doc.save();
          migratedCount++;
          console.log(`Migrated document: ${doc._id}`);
        }
      }
    }

    console.log(`Migration completed. ${migratedCount} documents migrated.`);
  } catch (err) {
    console.error('Error running BrandEmailCount migration:', err);
  }
};

if (process.env.RUN_EMAIL_MIGRATION === 'true') {
  migrateExistingData().catch(err => console.error('Migration failed:', err));
}

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

  async getCurrentStats(brandId) {
    return await BrandEmailCount.getCurrentStats(brandId);
  }

  async migrateData() {
    return await BrandEmailCount.migrateToConsolidatedStructure();
  }
}

export default BrandEmailCount;