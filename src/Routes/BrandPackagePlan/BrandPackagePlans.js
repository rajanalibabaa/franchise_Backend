import express from "express";
import { createBrandPackage } from "../../controller/BrandPackagePlans/brandPackagePlans.js";

const brandPackagePlansRouter = express.Router();

/* ================= CREATE PACKAGES ================= */
brandPackagePlansRouter.post("/v1/brand-packages-plans/create", createBrandPackage);
// brandPackagePlansRouter.put("/v1/brand-packages-plans/upgrade", upgradeBrandPackages);
export default brandPackagePlansRouter;