import express from "express";
import { getAllInstaApply, getInstaApplyById, instaApplyBrandFormController, } from "../../controller/BrandController/instaApplyBrnadFormController.js";
import { verifyJWT } from "../../Middleware/Authentication/authMiddleware.js";

export const InstantApplyRouter = express.Router();

InstantApplyRouter.post("/postApplication/:id",verifyJWT, instaApplyBrandFormController)
InstantApplyRouter.get("/getInstaApplyById/:id",verifyJWT, getInstaApplyById)


InstantApplyRouter.get("/getAllInstaApply/:id",verifyJWT, getAllInstaApply)
 


