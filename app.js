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
import { fbPostsRouter } from "./src/Routes/AdminRoutes/SocialMediaRoutes/fbPostsRoutes.js";
import { videoAdvertiseRoute } from "./src/Routes/AdminRoutes/AdminVideoAdvertiseRoutes.js";

import { Login } from "./src/Routes/Login/LoginRoutes.js";
import { logoutRouter } from "./src/Routes/Logout/logoutRoute.js";
import sendOtpRouter from "./src/Routes/otpSenderRouter/sendOtp.js";
import adminAuthRoutes from './src/Routes/AdminRoutes/adminAuthRoutes.js';
import incomeInvestor from "./src/Routes/newIncomerInvestorRoutes/newincomerInvestorRoutes.js"
import brandListingRoutes from "./src/Routes/BrandRoutes/brandListingRoutes.js";


const router = express.Router();

router.use('/v1/auth/', thirdPartyAuthRouter)
router.use('/v1/login/', Login) 

router.use('/post',postRequireRoutes);

router.use('/feedback', feedbackRoutes);
router.use('/complaint', complaintRoutes);
router.use('/instaApply', instaApplyRoutes);
router.use('/v1/brand',brandRoutes )
router.use('/newIncomerInvestor',incomeInvestor );
router.use('/v1/adminAuth', adminAuthRoutes);
router.use('/v1/investor',InvestorRouter)
router.use('/v1/brandlisting',brandListingRoutes)

// admin
router.use("/admin",adminRoutess );
router.use('/v1/admin/dashboard', AdminDashBoardClientRouter)

// video advertise
router.use('/v1/admin/videoAdvertise', videoAdvertiseRoute)

router.use('/v1/brand/register',BrandRegisterRoute)

//logout routers
router.use('/v1/logout', logoutRouter)

router.use('/v1/socialmedia/fb',fbPostsRouter)

//login routers
router.use('/v1/login', Login)

router.use('/v1/otpverify',sendOtpRouter)



export default router;
