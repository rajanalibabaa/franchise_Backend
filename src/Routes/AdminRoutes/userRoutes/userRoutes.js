
import  { Router } from "express"
import { userCount } from "../../../controller/Admin/user/userController.js";

export const userRouter = Router()

userRouter.get("/v1/admin/userCount",userCount)