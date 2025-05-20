import express from "express";
import thirdPartyAuthRouter from './src/Routes/ThirdpartyRoutes/thirdpartyAuthenticationRouters.js';
// import InvestorloginRouter from './src/Routes/InvestorRoutes/InvestorLoginRoutes.js';
// import invsRegisterRoutes from "./src/Routes/invRegisterRoutes.js";
import postRequireRoutes  from "./src/Routes/postRequirementRoutes.js";
import feedbackRoutes from "./src/Routes/FeedbackRoutes/feedbackRoutes.js";
import complaintRoutes from './src/Routes/ComplaintRoutes/complaintRoutes.js';
import instaApplyRoutes from './src/Routes/InstaApplyRoutes/instaApplyRoutes.js';
import brandRoutes from "./src/Routes/BrandRoutes/brandListingRoutes.js";
import adminRoutess from "./src/Routes/AdminRoutes/adminsRoutes.js"

import { AdminDashBoardClientRouter } from "./src/Routes/AdminRoutes/AdminDashBoardClientRouter.js";
import { BrandRegisterRoute } from "./src/Routes/BrandRoutes/BrandRegistorRoutes.js"
import { InvestorRouter } from "./src/Routes/InvestorRoutes/invRegisterRoutes.js";
import { Login } from "./src/Routes/Login/LoginRoutes.js";
import { logoutRouter } from "./src/Routes/Logout/logoutRoute.js";
import { fbPostsRouter } from "./src/Routes/AdminRoutes/SocialMediaRoutes/fbPostsRoutes.js";
import { videoAdvertiseRoute } from "./src/Routes/AdminRoutes/AdminVideoAdvertiseRoutes.js";
 

const router = express.Router();

router.use('/v1/auth/', thirdPartyAuthRouter)
// router.use('/v1/login/', InvestorloginRouter)

router.use('/post',postRequireRoutes);

router.use('/feedback', feedbackRoutes);
router.use('/complaint', complaintRoutes);
router.use('/instaApply', instaApplyRoutes);
router.use('/v1/brand',brandRoutes )

// investor routes
router.use('/v1/investor',InvestorRouter)

// admin
router.use("/admin",adminRoutess );
router.use('/v1/admin/dashboard', AdminDashBoardClientRouter)

// video advertise
router.use('/v1/admin/videoAdvertise', videoAdvertiseRoute)

router.use('/v1/brand/register',BrandRegisterRoute)

//logout routers
router.use('/v1/logout', logoutRouter)


//login routers
router.use('/v1/login', Login)


// social media routes

//fb posts routes
router.use('/v1/socialmedia/fb',fbPostsRouter)


export default router;
