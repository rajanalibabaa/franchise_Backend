import express from "express";
import brandListingRoutes from "./src/Routes/brandListingRoutes.js";


const router = express.Router();

router.use('/brand',brandListingRoutes);


export default router;