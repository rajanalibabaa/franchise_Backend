import express from "express";
import { instaApplyBrandFormController, } from "../../controller/BrandController/instaApplyBrnadFormController.js";
import { verifyJWT } from "../../Middleware/Authentication/authMiddleware.js";

export const InstantApplyRouter = express.Router();

InstantApplyRouter.post("/postApplication/:id",verifyJWT, instaApplyBrandFormController)
 


