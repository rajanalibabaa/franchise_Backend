import express from "express";
import {  getAllInstaApplyToBrand, getAllLeads, getInstaApplyById, instaApplyBrandFormController,getInstantApplyLocationLeadControllerById, getAllInstantApply, getInstantApplyDropDownData, getInstantApplySearchData } from "../../controller/BrandController/instaApplyBrnadFormController.js";
import { verifyJWT } from "../../Middleware/Authentication/authMiddleware.js";

export const InstantApplyRouter = express.Router();

InstantApplyRouter.post("/v1/instantapply/postApplication", instaApplyBrandFormController)
InstantApplyRouter.get("/v1/instantapply/getInstaApplyById/:id",verifyJWT, getInstaApplyById)

InstantApplyRouter.get("/v1/instantapply/getInstantApplyLocationLeadControllerById/:id",verifyJWT,getInstantApplyLocationLeadControllerById)

InstantApplyRouter.get("/v1/instantapply/getAllInstaApply/:id",verifyJWT, getAllInstaApplyToBrand)

InstantApplyRouter.get("/v1/instantapply/getAllLeads/:id",verifyJWT, getAllLeads)

// admin
InstantApplyRouter.get("/v1/admin/instantapply/getAllInstantApply/:id",verifyJWT, getAllInstantApply)
InstantApplyRouter.get("/v1/admin/instantapply/getInstantApplyDropDownData/:id",verifyJWT, getInstantApplyDropDownData)
InstantApplyRouter.post("/v1/admin/instantapply/getInstantApplySearchData/:id",verifyJWT, getInstantApplySearchData)



