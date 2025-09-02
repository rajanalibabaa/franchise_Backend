import { Router } from "express";
import { overAllPlatformOnlyMainCategory } from "../../controller/BrandController/overAllPlatformController.js";

export const overAllPlatformRoutes = Router();


overAllPlatformRoutes.get("/v1/overAllPlatform", overAllPlatformOnlyMainCategory)
