import { Router } from "express";
import { getAllPauseBrand, toggleBrandPausePlay } from "../../../controller/Admin/Brand/brandPausePlay.controller.js";

export const brandpauseplayRouter = Router()

brandpauseplayRouter.post("/v1/admin/toggleBrandPausePlay/:id",toggleBrandPausePlay)
brandpauseplayRouter.get("/v1/admin/getAllPauseBrand",getAllPauseBrand)