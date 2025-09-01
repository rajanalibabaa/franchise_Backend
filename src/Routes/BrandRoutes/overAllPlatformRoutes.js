import { Router } from "express";
import { overAllPlatform } from "../../controller/BrandController/overAllPlatformController.js";

export const overAllPlatformRoutes = Router();


overAllPlatformRoutes.get("/v1/overAllPlatform", overAllPlatform)
