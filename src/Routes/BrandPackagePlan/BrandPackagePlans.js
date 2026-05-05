import express from "express";
import {createIntialPackages,updateBrandPackages} from "../../controller/BrandPackagePlans/brandPackagePlans.js";

const brandPackagePlansRouter = express.Router();

/* ================= CREATE PACKAGES ================= */
brandPackagePlansRouter.post("/v1/brand-packages-plans/create", createIntialPackages);
brandPackagePlansRouter.put("/v1/brand-packages-plans/update", updateBrandPackages);
// brandPackagePlansRouter.put("/v1/brand-packages-plans/upgrade", upgradeBrandPackages);
export default brandPackagePlansRouter;