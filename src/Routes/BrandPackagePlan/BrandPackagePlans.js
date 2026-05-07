import express from "express";

import {createIntialPackages,updateBrandPackages,getBrandPackagesById,upgradePlanController,brandPackageHistory,getBrandPackagesHistoryById} from "../../controller/BrandPackagePlans/brandPackagePlans.js";

const brandPackagePlansRouter = express.Router();

/* ================= CREATE PACKAGES ================= */
brandPackagePlansRouter.post("/v1/brand-packages-plans/create", createIntialPackages);
brandPackagePlansRouter.put("/v1/brand-packages-plans/update", updateBrandPackages);
brandPackagePlansRouter.patch("/v1/brand-packages-plans/upgrade", upgradePlanController);
brandPackagePlansRouter.get("/v1/brand-packages-plans/get/:brandOwnerId", getBrandPackagesById);
brandPackagePlansRouter.get("/v1/brand-packages-plans/update-history/:brandOwnerId", brandPackageHistory);
brandPackagePlansRouter.get("/v1/brand-packages-plans/get-history/:brandOwnerId", getBrandPackagesHistoryById);
export default brandPackagePlansRouter;