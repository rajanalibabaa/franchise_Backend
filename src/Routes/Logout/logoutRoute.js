import { Router } from "express";
import { logOut } from "../../controller/Logout/logoutController.js";
import { verifyJWT } from "../../Middleware/Authentication/AuthMiddleware.js";
// import { verifyBrand } from "../../Middleware/Authentication/brandAuthMiddleware.js";
// import { verifyInvestor } from "../../Middleware/Authentication/investorAuthMiddleware.js";


const logoutRouter = Router()

// let verify = verifyBrand || verifyInvestor

logoutRouter.post("/:uuid",verifyJWT,logOut)

export { logoutRouter }