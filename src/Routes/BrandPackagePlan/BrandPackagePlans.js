import express from "express";

import {createIntialPackages,updateBrandPackages,getBrandPackagesById,createBrandPackages,upgradeBrandPackages,getBrandPackagesHistoryById,activePackageStatus,} from "../../controller/BrandPackagePlans/brandPackagePlans.js";

const brandPackagePlansRouter = express.Router();

/* ================= CREATE PACKAGES ================= */
brandPackagePlansRouter.post("/v1/brand-packages-plans/createInitial", createIntialPackages);
brandPackagePlansRouter.put("/v1/brand-packages-plans/update", updateBrandPackages);
brandPackagePlansRouter.patch("/v1/brand-packages-plans/create", createBrandPackages);
brandPackagePlansRouter.get("/v1/brand-packages-plans/get/:brandOwnerId", getBrandPackagesById);
// brandPackagePlansRouter.get("/v1/brand-packages-plans/update-history/:brandOwnerId", brandPackageHistory);
brandPackagePlansRouter.get("/v1/brand-packages-plans/get-history/:brandOwnerId", getBrandPackagesHistoryById);
brandPackagePlansRouter.post("/v1/brand-packages-plans/active-package-status", activePackageStatus);
brandPackagePlansRouter.patch("/v1/brand-packages-plans/upgrade", upgradeBrandPackages);
export default brandPackagePlansRouter;  