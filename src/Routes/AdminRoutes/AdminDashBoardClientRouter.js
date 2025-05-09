import { Router } from "express";
import { getAllClientCount } from "../../controller/Admin/AdminDashboardClientCount.js";


const AdminDashBoardClientRouter = Router()

AdminDashBoardClientRouter.get('/getAdminDashBoardClient', getAllClientCount)

export { AdminDashBoardClientRouter }