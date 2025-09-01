import { Router } from "express";
import { getTopAutomotive, overAllPlatform } from "../../controller/BrandController/overAllPlatformController.js";

export const overAllPlatformRoutes = Router();

overAllPlatformRoutes.get("/v1/overAllplatform/test", overAllPlatform)

overAllPlatformRoutes.get("/v1/getTopAutomotive", getTopAutomotive)
