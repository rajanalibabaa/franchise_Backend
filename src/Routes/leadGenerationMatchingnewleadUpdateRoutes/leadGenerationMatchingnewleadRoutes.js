import express from "express";

import {
  findMatchingBrandsForEnquiry,
} from "../../controller/leadGenerationMatchingnewleadUpdate/leadGenerationMatchBrands.js";

import {FindBrandSendLeadToBrands} from "../../controller/leadGenerationMatchingnewleadUpdate/LeadMatchSendToBrands.js";
const leadPackageRoutermanual = express.Router();

leadPackageRoutermanual.post(
  "/v1/lead-match-enquiry",
  findMatchingBrandsForEnquiry,
);
leadPackageRoutermanual.post(
  "/v1/lead-match-send-to-brands",
  FindBrandSendLeadToBrands,
);
export default leadPackageRoutermanual;