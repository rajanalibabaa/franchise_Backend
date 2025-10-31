import { Router } from "express";
import { verifyJWT } from "../../../Middleware/Authentication/authMiddleware.js";
import { getAllPaidBrand, togglePayment } from "../../../controller/Admin/Brand/payment.controller.js";

export const paymentRouter = Router()

paymentRouter.post("/v1/admin/togglePayment/:id",verifyJWT,togglePayment)
paymentRouter.post("/v1/admin/getAllPaidBrand",verifyJWT,getAllPaidBrand)