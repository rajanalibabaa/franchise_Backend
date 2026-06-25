import express from "express";

import {createInitialPackages,updateBrandPackages,getBrandPackagesById,createBrandPackages,upgradeBrandPackages,getBrandPackagesHistoryById,activePackageStatus,getAllBrandPackages,updateBrandPackagecms} from "../../controller/BrandPackagePlans/brandPackagePlans.js";

const brandPackagePlansRouter = express.Router();

/* ================= CREATE PACKAGES ================= */
brandPackagePlansRouter.post("/v1/brand-packages-plans/createInitial", createInitialPackages);

brandPackagePlansRouter.put("/v1/brand-packages-plans/update", updateBrandPackages);
brandPackagePlansRouter.put("/v1/brand-packages-plans/update-cms/:id", updateBrandPackagecms);
brandPackagePlansRouter.patch("/v1/brand-packages-plans/create", createBrandPackages);
brandPackagePlansRouter.get("/v1/brand-packages-plans/get/:brandOwnerId", getBrandPackagesById);
// brandPackagePlansRouter.get("/v1/brand-packages-plans/update-history/:brandOwnerId", brandPackageHistory);
brandPackagePlansRouter.get("/v1/brand-packages-plans/get-history/:brandOwnerId", getBrandPackagesHistoryById);
brandPackagePlansRouter.post("/v1/brand-packages-plans/active-package-status", activePackageStatus);
brandPackagePlansRouter.put("/v1/brand-packages-plans/upgrade", upgradeBrandPackages);
brandPackagePlansRouter.get("/v1/brand-packages-plans/get-all", getAllBrandPackages); 
export default brandPackagePlansRouter;  