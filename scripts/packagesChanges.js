import mongoose from "mongoose";
import dotenv from "dotenv";
import { BrandDetails } from "../src/model/Brand/Brand.model/BrandDetails.model.js";
import { BrandFranchiseDetails } from "../src/model/Brand/Brand.model/FranchiseDetails.model.js";
import { BrandExpansionLocationData } from "../src/model/Brand/Brand.model/ExpansionLocation.model.js";
import { BrandPackages } from "../src/model/BrandPackagePlans/brandPackagePlans.js";
import Plan from "../src/model/PackagePlanCMS/PackagePlan.js";
 
dotenv.config({ path: "../.env" });
 
const MONGODB_URI = process.env.DB_URL;
 
const extractStatesFromExpansion = (expansionLocationData) => {
  const locations =
    expansionLocationData?.expansionLocations?.domestic?.locations || [];

  return locations.map((loc) => ({
    state: loc?.state || "",
    district:
      (loc?.districts || [])
        .map((d) => d?.district)
        .filter(Boolean) || [],
  }));
};
 
const extractInvestmentRanges = (franchiseDetails) => {
  const ranges = new Set();
 
  const data =
    franchiseDetails?.investmentRange ||
    franchiseDetails?.fico?.[0]?.investmentRange ||
    [];
 
  if (Array.isArray(data)) {
    data.forEach((r) => r && ranges.add(r));
  } else if (typeof data === "string") {
    ranges.add(data);
  }
 
  return Array.from(ranges);
};
 
/* ================= MAIN SCRIPT ================= */
 
async function assignFreePackagesToAllBrands() {
  try {
    console.log("🔌 Connecting DB...");
    await mongoose.connect(MONGODB_URI);
 
    console.log("✅ Connected");
 
    const planDoc = await Plan.findOne();
 
    if (!planDoc) throw new Error("Plan document not found");
 
    const freePlan = planDoc.packagesPlan.find(
      (p) => p.packageType === "FREE"
    );
 
    if (!freePlan) throw new Error("FREE plan not found");
 
    const freePackage = freePlan.packages[0];
 
    const brands = await BrandDetails.find(
      {},
      { uuid: 1, "brandDetails.brandName": 1 }
    );
 
    console.log(`📦 Total Brands: ${brands.length}`);
 
    let created = 0;
    let skipped = 0;
 
    for (const brand of brands) {
      const brandOwnerId = brand.uuid;
 
      // 🔹 Skip if already has FREE package
      const exists = await BrandPackages.findOne({
        brandOwnerId,
        "packages.packagesType": "FREE",
      });
 
      if (exists) {
        skipped++;
        continue;
      }
 
      // 🔹 Fetch related data
      const [franchiseDoc, expansionDoc] = await Promise.all([
        BrandFranchiseDetails.findOne({ brandOwnerId }),
        BrandExpansionLocationData.findOne({ brandOwnerId }),
      ]);
 
      const franchiseDetails = franchiseDoc?.franchiseDetails || {};
      const expansionLocationData =
        expansionDoc?.expansionLocationData || {};
 
      const stateDistrictData = extractStatesFromExpansion(expansionLocationData);
      const ranges = extractInvestmentRanges(franchiseDetails);
 
      if (stateDistrictData.length === 0) {
        stateDistrictData.push({
          state: "All",
          district: [],
        });
      }
      if (ranges.length === 0) ranges.push("General");
 
      const totalLeads = Number(freePackage.totalLeads) || 0;
 
      const investmentranges = ranges.map((range) => ({
        brandName: brand?.brandDetails?.brandName || "",
        selectedPlanInvestmetrange: range,
        selectedPlanStateAndDistrict: stateDistrictData.map((item) => ({
          state: item.state || "",
          district: item.district || [],
        })),
      }));
 
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Number(freePackage.validityDays || 30));
 
      const packagesToAssign = [
        {
          packagesType: "FREE",
          investmetPackages: [
            {
              packagesName: freePlan.planName,
              planUniqueId: freePlan.planUniqueId,
              investmetRageLabel: freePackage.investmentRangeLabel || "",
              investmentranges,
              validity: String(freePackage.validityDays || 30),
              totalLeads: totalLeads,
              sendingLeads: 0,
              sendingPercentage: 0,
              remainingLeads: totalLeads,
              totalAmount: 0,
              packageStartDate: startDate,
              packageEndDate: endDate,
              currentDate: startDate,
              renewalEndDate: endDate,
              isPaused: false,
              pauseHistory: [],
              isExperied: false,
              isActive: true,
              isPending: false,
            },
          ],
        },
      ];
 
      await BrandPackages.findOneAndUpdate(
        { brandOwnerId },
        {
          $set: {
            industry: franchiseDetails?.brandCategories?.main || "",
            category: franchiseDetails?.brandCategories?.sub || "",
            brandName: brand?.brandDetails?.brandName || "",
          },
          $push: {
            packages: { $each: packagesToAssign },
          },
        },
        { upsert: true }
      );
 
      created++;
 
      if (created % 50 === 0) {
        console.log(`🚀 Processed: ${created}`);
      }
    }
 
    console.log("\n✅ DONE");
    console.log(`✔ Created: ${created}`);
    console.log(`⏭ Skipped: ${skipped}`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
}
 
assignFreePackagesToAllBrands();