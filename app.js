import express from "express";
import brandListingRoutes from "./src/Routes/brandListingRoutes.js";
import invsRegisterRoutes from "./src/Routes/invRegisterRoutes.js"



const router = express.Router();

router.use('/brand',brandListingRoutes);
router.use('/investor',invsRegisterRoutes);


export default router;