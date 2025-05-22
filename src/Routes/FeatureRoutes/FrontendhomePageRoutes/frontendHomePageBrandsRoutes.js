
import { Router } from "express";
import { getAllnewRegisterBrands, getbrandsbyCityName, getbrandsbyInvestmentRange } from "../../../controller/Feature/FrontendHomePageFeature/frontendHomePageBrandsController.js";

export const frontendHomePageBrandsRouter = Router();

frontendHomePageBrandsRouter.get("/getAllnewRegisterBrands", getAllnewRegisterBrands)
frontendHomePageBrandsRouter.get("/getbrandsbyCityName", getbrandsbyCityName)
frontendHomePageBrandsRouter.get("/getbrandsbyInvestmentRange", getbrandsbyInvestmentRange)

