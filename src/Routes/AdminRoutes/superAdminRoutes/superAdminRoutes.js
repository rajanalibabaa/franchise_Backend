import { Router } from "express";
import { createSuperAdmin } from "../../../controller/Admin/SuperAdmin/superAdmin.controller.js";

export const superAdminRouter = Router()

superAdminRouter.post('/createSuperAdmin',createSuperAdmin)