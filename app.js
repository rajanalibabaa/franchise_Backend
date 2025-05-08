import express from "express";
import thirdPartyAuthRouter from './src/Routes/ThirdpartyRoutes/thirdpartyAuthenticationRouters.js';
import InvestorloginRouter from './src/Routes/InvestorRoutes/InvestorLoginRoutes.js';
import invsRegisterRoutes from "./src/Routes/invRegisterRoutes.js";
import postRequireRoutes  from "./src/Routes/postRequirementRoutes.js";
import feedbackRoutes from "./src/Routes/FeedbackRoutes/feedbackRoutes.js";
import complaintRoutes from './src/Routes/ComplaintRoutes/complaintRoutes.js';
import instaApplyRoutes from './src/Routes/InstaApplyRoutes/instaApplyRoutes.js';
import brandRoutes from "./src/Routes/BrandRoutes/brandListingRoutes.js";
import adminRoutess from "./src/Routes/AdminRoutes/adminsRoutes.js"

import { AdminDashBoardClientRouter } from "./src/Routes/AdminRoutes/AdminDashBoardClientRouter.js";
import { BrandRegisterRoute } from "./src/Routes/BrandRoutes/BrandRegistorRoutes.js"
 

const router = express.Router();

router.use('/v1/auth/', thirdPartyAuthRouter)
router.use('/v1/login/', InvestorloginRouter)
router.use('/investor',invsRegisterRoutes)
router.use('/post',postRequireRoutes);
router.use("/admin",adminRoutess );
router.use('/feedback', feedbackRoutes);
router.use('/complaint', complaintRoutes);
router.use('/instaApply', instaApplyRoutes);
router.use('/brand',brandRoutes )





<<<<<<< HEAD
router.use('/v1/admin/dashboard', AdminDashBoardClientRouter)
router.use('/v1/brand/register',BrandRegisterRoute)

export default router;
=======

export default router;
>>>>>>> 7a716c35bfb92c31badb96514c97dce2a237498e
