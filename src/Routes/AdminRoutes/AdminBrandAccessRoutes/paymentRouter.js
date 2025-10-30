import { Router } from "express";
import { verifyJWT } from "../../../Middleware/Authentication/authMiddleware.js";
import { togglePayment } from "../../../controller/Admin/Brand/payment.controller.js";

export const paymentRouter = Router()

paymentRouter.post("/v1/admin/togglePayment/:id",verifyJWT,togglePayment)