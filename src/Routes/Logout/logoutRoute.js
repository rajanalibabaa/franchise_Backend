import { Router } from "express";
import { autoLogOut, logOut } from "../../controller/Logout/logoutController.js";
import { verifyJWT } from "../../Middleware/Authentication/authMiddleware.js";

const logoutRouter = Router()

logoutRouter.post("/v1/logout/:uuid",verifyJWT,logOut)
logoutRouter.post("/v1/autoLogOut/:uuid",verifyJWT,autoLogOut)
 
export { logoutRouter }