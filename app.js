import express from "express";
import brandListingRoutes from "./src/Routes/brandListingRoutes.js";

// import invsRegisterRoutes from "./src/Routes/invRegisterRoutes.js"
import thirdPartyAuthRouter from './src/Routes/ThirdpartyRoutes/thirdpartyAuthenticationRouters.js'
import InvestorloginRouter from './src/Routes/InvestorRoutes/InvestorLoginRoutes.js'
import invsRegisterRoutes from "./src/Routes/invRegisterRoutes.js"
import postRequireRoutes  from "./src/Routes/postRequirementRoutes.js"
// import adminRoutes from "./src/Routes/adminAuthRoutes.js"

import adminRoutes from "./src/Routes/AdminRoutes/AdminRoutes.js"
import adminVideoAdvertiseRouter from './src/Routes/AdminRoutes/AdminVideoAdvertiseRoutes.js'

const router = express.Router();

router.use('/brand',brandListingRoutes);
router.use('/v1/auth/', thirdPartyAuthRouter)
router.use('/v1/login/', InvestorloginRouter)
router.use('/investor',invsRegisterRoutes)
router.use('/post',postRequireRoutes);
// router.use("/admin", adminRoutes);




router.use("/v1/admin", adminRoutes)

router.use('/v1/admin/videoAdvertise', adminVideoAdvertiseRouter)


export default router;