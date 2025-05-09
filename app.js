import express from "express";
import brandListingRoutes from "./src/Routes/brandListingRoutes.js";
import thirdPartyAuthRouter from './src/Routes/ThirdpartyRoutes/thirdpartyAuthenticationRouters.js';
import InvestorloginRouter from './src/Routes/InvestorRoutes/InvestorLoginRoutes.js';
import invsRegisterRoutes from "./src/Routes/invRegisterRoutes.js";
import postRequireRoutes  from "./src/Routes/postRequirementRoutes.js";
import adminRoutes from './src/Routes/adminAuthRoutes.js'
import feedbackRoutes from "./src/Routes/FeedbackRoutes/feedbackRoutes.js";
import complaintRoutes from './src/Routes/ComplaintRoutes/complaintRoutes.js';
import instaApplyRoutes from './src/Routes/InstaApplyRoutes/instaApplyRoutes.js';
// import brandAndPostReqController from "./src/Routes/LeadMatching&DistributionRoutes/brandAndPostRoutes.js";
// import route from "./src/Routes/AdminRoutes.js";
import newIncomeInvestorRoutes from './src/Routes/newIncomerInvestorRoutes/newincomerInvestorRoutes.js';


const router = express.Router();

router.use('/brand',brandListingRoutes);
router.use('/v1/auth/', thirdPartyAuthRouter)
router.use('/v1/login/', InvestorloginRouter)
router.use('/investor',invsRegisterRoutes)
router.use('/post',postRequireRoutes);
router.use("/admin", adminRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/complaint', complaintRoutes);
router.use('/instaApply', instaApplyRoutes);
router.use('/newIncomerData', newIncomeInvestorRoutes);
// router.use('/lead', brandAndPostReqController);





export default router;