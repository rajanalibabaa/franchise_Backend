import { Router } from "express";
import { createIndustryManagement, deleteIndustryById, getAllIndustry, getIndustryByIndustryName, updateIndustryById } from "../../../controller/Admin/industryManagement/industryCMScontroller.js";
import { verifyJWT } from "../../../Middleware/Authentication/authMiddleware.js";

export const industryManagementRouter = Router()

industryManagementRouter.post("/v1/admin/createIndustryManagement",createIndustryManagement)
industryManagementRouter.get("/v1/admin/getIndustryByIndustryName",verifyJWT,getIndustryByIndustryName)
industryManagementRouter.get("/v1/admin/getAllIndustry",getAllIndustry)
industryManagementRouter.patch("/v1/admin/updateIndustryById/:id",updateIndustryById)
industryManagementRouter.delete("/v1/admin/deleteIndustryById/:id",deleteIndustryById)