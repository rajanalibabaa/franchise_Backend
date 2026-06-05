import express from "express"
import { updateLeadMatchPerBrand,getLeadMatchPerBrand } from "../../../../controller/CMS/LeadDistributionAdminAccess/leadMatchingRulePerBrand.js";



const leadMatchingRulePerBrand = express.Router();


leadMatchingRulePerBrand.put("/v1/leadMatchingRulePerBrand/update/:brandOwnerId",updateLeadMatchPerBrand)
leadMatchingRulePerBrand.get("/v1/leadMatchingRulePerBrand/get/:brandOwnerId",getLeadMatchPerBrand)

export default leadMatchingRulePerBrand;