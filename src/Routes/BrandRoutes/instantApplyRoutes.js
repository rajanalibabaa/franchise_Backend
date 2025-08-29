import express from "express";
import {  getAllInstaApplyToBrand, getAllLeads, getInstaApplyById, instaApplyBrandFormController,getInstantApplyLocationLeadControllerById } from "../../controller/BrandController/instaApplyBrnadFormController.js";
import { verifyJWT } from "../../Middleware/Authentication/authMiddleware.js";

export const InstantApplyRouter = express.Router();

InstantApplyRouter.post("/v1/instantapply/postApplication", instaApplyBrandFormController)
InstantApplyRouter.get("/v1/instantapply/getInstaApplyById/:id",verifyJWT, getInstaApplyById)

InstantApplyRouter.get("/v1/instantapply/getInstantApplyLocationLeadControllerById/:id",verifyJWT,getInstantApplyLocationLeadControllerById)

InstantApplyRouter.get("/v1/instantapply/getAllInstaApply/:id",verifyJWT, getAllInstaApplyToBrand)

InstantApplyRouter.get("/v1/instantapply/getAllLeads/:id",verifyJWT, getAllLeads)
 


