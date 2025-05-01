import express from "express";
import brandListingRoutes from "./src/Routes/brandListingRoutes.js";

// import invsRegisterRoutes from "./src/Routes/invRegisterRoutes.js"
import thirdPartyAuthRouter from './src/Routes/thirdpartyAuthenticationRouters.js'
<<<<<<< HEAD
import loginRouter from './src/Routes/LoginRoutes.js'
=======
import loginRouter from './src/Routes/InvestorRoutes.js'
>>>>>>> e34dc82f3035fc8900f28fa2d54d033d58b0e019
import invsRegisterRoutes from "./src/Routes/invRegisterRoutes.js"



const router = express.Router();

router.use('/brand',brandListingRoutes);
router.use('/v1/auth/', thirdPartyAuthRouter)
<<<<<<< HEAD
router.use('/v1/login/', loginRouter)
=======
// router.use('/v1/login/', loginRouter)
>>>>>>> e34dc82f3035fc8900f28fa2d54d033d58b0e019
router.use('/investor',invsRegisterRoutes);



<<<<<<< HEAD
=======
// Investor route
router.use('/v1/investor/', loginRouter)


// Admin route
import adminRouter from './src/Routes/AdminRoutes.js'
router.use('/v1/admin', adminRouter)

>>>>>>> e34dc82f3035fc8900f28fa2d54d033d58b0e019
export default router;