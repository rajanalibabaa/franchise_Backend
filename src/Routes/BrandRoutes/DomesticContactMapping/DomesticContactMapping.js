import express from "express";

const domesticContactMappingRouter = express.Router();

import {getBrandContactMappingById} from "../../../controller/BrandController/DomesticContactMapping/DomesticContactMapping.js";



domesticContactMappingRouter.get("/v1/domestic-contact-mapping/:brandOwnerId", getBrandContactMappingById);

export default domesticContactMappingRouter;
