import { Router } from "express";
import { getAllPauseBrand, toggleBrandPausePlay } from "../../../controller/Admin/Brand/brandPausePlay.controller.js";
import { verifyJWT } from "../../../Middleware/Authentication/authMiddleware.js";

export const brandpauseplayRouter = Router()

brandpauseplayRouter.post("/v1/admin/toggleBrandPausePlay/:id",verifyJWT,toggleBrandPausePlay)
brandpauseplayRouter.get("/v1/admin/getAllPauseBrand",verifyJWT,getAllPauseBrand)