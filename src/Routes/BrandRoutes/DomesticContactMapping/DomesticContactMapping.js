import express from "express";

const domesticContactMappingRouter = express.Router();

import {getBrandContactStates,getDistrictsByState,updateContactMapping,exportBrandProductTagsReport,bulkUpdateFranchiseModelType} from "../../../controller/BrandController/DomesticContactMapping/DomesticContactMapping.js";


domesticContactMappingRouter.get(
  "/v1/domestic-contact-mapping-states/:brandOwnerId",
  getBrandContactStates
);

domesticContactMappingRouter.get(
  "/v1/domestic-contact-mapping/districts/:brandOwnerId/:state",
  getDistrictsByState
);
domesticContactMappingRouter.put(
  "/v1/domestic-contact-mapping-update",
  updateContactMapping
);
domesticContactMappingRouter.get("/v1/domestic-contact-mapping-export",exportBrandProductTagsReport)
domesticContactMappingRouter.patch("/v1/domestic-contact-mapping-fico",bulkUpdateFranchiseModelType)

export default domesticContactMappingRouter;
