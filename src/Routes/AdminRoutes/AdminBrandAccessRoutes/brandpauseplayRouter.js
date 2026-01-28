import { Router } from "express";
import {
  getAllPauseBrand,
  toggleBrandPausePlay,
} from "../../../controller/Admin/Brand/brandPausePlay.controller.js";
import { verifyJWT } from "../../../Middleware/Authentication/authMiddleware.js";
import { togglePaidleadPausedandPlayById } from "../../../controller/Admin/Brand/leads.controller.js";

export const brandpauseplayRouter = Router();

brandpauseplayRouter.post(
  "/v1/admin/toggleBrandPausePlay/:id",
  verifyJWT,
  toggleBrandPausePlay,
);
brandpauseplayRouter.post(
  "/v1/admin/togglePaidleadPausedandPlayById/:id",
  togglePaidleadPausedandPlayById,
);
brandpauseplayRouter.get(
  "/v1/admin/getAllPauseBrand",
  verifyJWT,
  getAllPauseBrand,
);
