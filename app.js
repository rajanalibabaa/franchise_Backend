import express from "express";
import brandListingRoutes from "./src/Routes/brandListingRoutes.js";
<<<<<<< HEAD
import invsRegisterRoutes from "./src/Routes/invRegisterRoutes.js"


=======

import thirdPartyAuthRouter from './src/Routes/thirdpartyAuthenticationRouters.js'
import loginRouter from './src/Routes/LoginRoutes.js'
>>>>>>> 3e7954f980a44a0ff8e0734c11b5fc05bd36c29d

const router = express.Router();

router.use('/brand',brandListingRoutes);
<<<<<<< HEAD
router.use('/investor',invsRegisterRoutes);
=======

router.use('/v1/auth/', thirdPartyAuthRouter)
router.use('/v1/login/', loginRouter)
>>>>>>> 3e7954f980a44a0ff8e0734c11b5fc05bd36c29d


export default router;