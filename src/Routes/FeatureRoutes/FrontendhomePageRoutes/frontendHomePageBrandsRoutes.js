
import { Router } from "express";
import { getAllnewRegisterBrands, getbrandsbyCityName, getbrandsbyInvestmentRange } from "../../../controller/Feature/FrontendHomePageFeature/frontendHomePageBrandsController.js";

export const frontendHomePageBrandsRouter = Router();

frontendHomePageBrandsRouter.get("/v1/homepage/getAllnewRegisterBrands", getAllnewRegisterBrands)
frontendHomePageBrandsRouter.get("/v1/homepage/getbrandsbyCityName", getbrandsbyCityName)
frontendHomePageBrandsRouter.get("/v1/homepage/getbrandsbyInvestmentRange", getbrandsbyInvestmentRange)