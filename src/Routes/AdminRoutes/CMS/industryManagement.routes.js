import { Router } from "express";
import { createIndustryManagement, getAllIndustry, getIndustryByIndustryName } from "../../../controller/Admin/industryManagement/industryCMScontroller.js";
import { verifyJWT } from "../../../Middleware/Authentication/authMiddleware.js";

export const industryManagementRouter = Router()

industryManagementRouter.post("/v1/admin/createIndustryManagement",verifyJWT,createIndustryManagement)
industryManagementRouter.get("/v1/admin/getIndustryByIndustryName",getIndustryByIndustryName)
industryManagementRouter.get("/v1/admin/getAllIndustry",getAllIndustry)