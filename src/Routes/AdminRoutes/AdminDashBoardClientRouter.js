import { Router } from "express";
import { getAllClientCount } from "../../controller/Admin/AdminDashboardClientCount.js";


const AdminDashBoardClientRouter = Router()

AdminDashBoardClientRouter.get('/v1/admin/dashboard/getAdminDashBoardClient', getAllClientCount)

export { AdminDashBoardClientRouter }