import express from "express";
import { requestOtp, verifyOtp } from "../controller/AdminController/adminAuthController.js";
import { verifyJWT } from "../Middleware/adminAuthMiddleware.js";


const router = express.Router();

// router.post("/requestotp", requestOtp);
// router.get ('/dashboard',verifyJWT,(req,res)=>{
//     res.json({ message : `Welcome to the dashboard, ${req.user.name}`})
// })

router.post("/verifyotp", verifyOtp,verifyJWT);
router.post("/sendotp",requestOtp)

export default router;
 