import express from "express";
import thirdPartyAuthRouter from './src/Routes/ThirdpartyRoutes/thirdpartyAuthenticationRouters.js';
// import InvestorloginRouter from './src/Routes/InvestorRoutes/InvestorLoginRoutes.js';
// import invsRegisterRoutes from "./src/Routes/invRegisterRoutes.js";

import feedbackRoutes from "./src/Routes/FeedbackRoutes/feedbackRoutes.js";
import complaintRoutes from './src/Routes/ComplaintRoutes/complaintRoutes.js';
import instaApplyRoutes from './src/Routes/InstaApplyRoutes/instaApplyRoutes.js';
import brandRoutes from "./src/Routes/BrandRoutes/brandListingRoutes.js";
import adminRoutess from "./src/Routes/AdminRoutes/adminsRoutes.js"
import postRequireRoutes from  './src/Routes/PostRequirementRoutes/postRequirementRoutes.js';
import { AdminDashBoardClientRouter } from "./src/Routes/AdminRoutes/AdminDashBoardClientRouter.js";
import { BrandRegisterRoute } from "./src/Routes/BrandRoutes/BrandRegistorRoutes.js"
import { InvestorRouter } from "./src/Routes/InvestorRoutes/invRegisterRoutes.js";
import { InvestorLogoutRoutes } from "./src/Routes/InvestorRoutes/InvestorLogoutRoutes.js";
import { Login } from "./src/Routes/Login/LoginRoutes.js";
import { newIncomerInvestor } from "./src/Routes/newIncomerInvestorRoutes/newincomerInvestorRoutes.js";
import adminAuthRoutes from './src/Routes/AdminRoutes/adminAuthRoutes.js';


const router = express.Router();

router.use('/v1/auth/', thirdPartyAuthRouter)
// router.use('/v1/login/', InvestorloginRouter)

router.use('/post',postRequireRoutes);
router.use("/admin",adminRoutess );
router.use('/feedback', feedbackRoutes);
router.use('/complaint', complaintRoutes);
router.use('/instaApply', instaApplyRoutes);
router.use('/v1/brand',brandRoutes);
router.use('/newIncomerInvestor', newIncomerInvestor);
router.use('/v1/adminAuth', adminAuthRoutes);


router.use('/v1/investor',InvestorRouter)



router.use('/v1/admin/dashboard', AdminDashBoardClientRouter)
router.use('/v1/brand/register',BrandRegisterRoute)

//logout routers
router.use('/v1/logout', InvestorLogoutRoutes)

//login routers
router.use('/v1/login', Login)

export default router;
