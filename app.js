import express from "express";
import brandListingRoutes from "./src/Routes/brandListingRoutes.js";

// import invsRegisterRoutes from "./src/Routes/invRegisterRoutes.js"
import thirdPartyAuthRouter from './src/Routes/ThirdpartyRoutes/thirdpartyAuthenticationRouters.js'
import InvestorloginRouter from './src/Routes/InvestorRoutes/InvestorLoginRoutes.js'
import invsRegisterRoutes from "./src/Routes/invRegisterRoutes.js"



const router = express.Router();

router.use('/brand',brandListingRoutes);
router.use('/v1/auth/', thirdPartyAuthRouter)
// router.use('/v1/login/', loginRouter)
router.use('/investor',invsRegisterRoutes);



// Investor route
router.use('/v1/investor/', InvestorloginRouter)


// Admin route
import adminRouter from './src/Routes/AdminRoutes/AdminRoutes.js'
router.use('/v1/admin', adminRouter)

export default router;