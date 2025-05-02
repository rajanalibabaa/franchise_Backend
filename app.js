import express from "express";
import brandListingRoutes from "./src/Routes/brandListingRoutes.js";

// import invsRegisterRoutes from "./src/Routes/invRegisterRoutes.js"
import thirdPartyAuthRouter from './src/Routes/thirdpartyAuthenticationRouters.js'
import loginRouter from './src/Routes/LoginRoutes.js'
import invsRegisterRoutes from "./src/Routes/invRegisterRoutes.js"
import postRequireRoutes  from "./src/Routes/postRequirementRoutes.js"
// import adminRoutes from "./src/Routes/adminAuthRoutes.js"
import adminRoutes from "./src/Routes/adminAuthRoutes.js"
import feedbackRoutes from "./src/Routes/feedbackRoutes.js"


const router = express.Router();

router.use('/brand',brandListingRoutes);
router.use('/v1/auth/', thirdPartyAuthRouter)
router.use('/v1/login/', loginRouter)
router.use('/investor',invsRegisterRoutes);
router.use('/post',postRequireRoutes);
// router.use("/admin", adminRoutes);
router.use("/admin", adminRoutes);
router.use('/feedback', feedbackRoutes);






export default router;