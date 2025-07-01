import express from "express";
import { getAllInstaApply, getInstaApplyById, instaApplyBrandFormController, } from "../../controller/BrandController/instaApplyBrnadFormController.js";
import { verifyJWT } from "../../Middleware/Authentication/authMiddleware.js";

export const InstantApplyRouter = express.Router();

InstantApplyRouter.post("/v1/instantapply/postApplication/:id",verifyJWT, instaApplyBrandFormController)
InstantApplyRouter.get("/v1/instantapply/getInstaApplyById/:id",verifyJWT, getInstaApplyById)


InstantApplyRouter.get("/v1/instantapply/getAllInstaApply/:id",verifyJWT, getAllInstaApply)
 


