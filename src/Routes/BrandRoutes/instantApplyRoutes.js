import express from "express";
import {  instaApplyBrandFormController,getLeadsByIndustryController } from "../../controller/BrandController/instaApplyBrnadFormController.js";
import { verifyJWT } from "../../Middleware/Authentication/authMiddleware.js";
import { leadsFreeAndPaidStopAndStart,getLeadStatus } from "../../controller/Admin/Brand/leads.controller.js";
import { getInstantApplyInvestorsController } from "../../controller/BrandController/InstantApplyFreeLeadData.js";

export const InstantApplyRouter = express.Router();

InstantApplyRouter.post("/v1/instantapply/postApplication", instaApplyBrandFormController)
// InstantApplyRouter.get("/v1/instantapply/getInstaApplyById/:id",verifyJWT, getInstaApplyById)

// InstantApplyRouter.get("/v1/instantapply/getInstantApplyLocationLeadControllerById/:id",verifyJWT,getInstantApplyLocationLeadControllerById)

// InstantApplyRouter.get("/v1/instantapply/getAllInstaApply/:id",verifyJWT, getAllInstaApplyToBrand)

InstantApplyRouter.get("/v1/instantapply/getAllLeads/:schema",getLeadsByIndustryController)

// // admin
// InstantApplyRouter.get("/v1/admin/instantapply/getAllInstantApply/:id",verifyJWT, getAllInstantApply)
// InstantApplyRouter.get("/v1/admin/instantapply/getInstantApplyDropDownData/:id",verifyJWT, getInstantApplyDropDownData)
// InstantApplyRouter.post("/v1/admin/instantapply/getInstantApplySearchData/:id",verifyJWT, getInstantApplySearchData)


InstantApplyRouter.get("/v1/admin/leadsFreeAndPaidStopAndStart",getLeadStatus)
InstantApplyRouter.put("/v1/admin/leadsFreeAndPaidStopAndStart",leadsFreeAndPaidStopAndStart)


//free Lead Get 

InstantApplyRouter.get("/v1/instantapply/getFreeLeads",getInstantApplyInvestorsController)