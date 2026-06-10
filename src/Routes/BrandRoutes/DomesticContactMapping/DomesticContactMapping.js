import express from "express";

const domesticContactMappingRouter = express.Router();

import {getBrandContactStates,getDistrictsByState} from "../../../controller/BrandController/DomesticContactMapping/DomesticContactMapping.js";


domesticContactMappingRouter.get(
  "/v1/domestic-contact-mapping-states/:brandOwnerId",
  getBrandContactStates
);

domesticContactMappingRouter.get(
  "/v1/domestic-contact-mapping/districts/:brandOwnerId/:state",
  getDistrictsByState
);

export default domesticContactMappingRouter;
