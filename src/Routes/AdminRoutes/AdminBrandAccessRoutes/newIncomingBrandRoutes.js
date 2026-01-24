import { Router } from "express";
import {
  brandApprove,
  deleteBrandById,
  deleteNewIncomingBrandById,
  getNewIncomingBrandById,
  getNewIncomingBrands,
} from "../../../controller/Admin/Brand/newBrand.js";

export const newIncomingBrandRouter = Router();

newIncomingBrandRouter.get(
  "/v1/admin/getNewIncomingBrands",
  getNewIncomingBrands,
);
newIncomingBrandRouter.get(
  "/v1/admin/getNewIncomingBrandById/:id",
  getNewIncomingBrandById,
);
newIncomingBrandRouter.post("/v1/admin/brandApprove/:id", brandApprove);
newIncomingBrandRouter.delete("/v1/admin/deleteBrandById/:id", deleteBrandById);
newIncomingBrandRouter.delete(
  "/v1/admin/deleteNewIncomingBrandById/:id",
  deleteNewIncomingBrandById,
);
