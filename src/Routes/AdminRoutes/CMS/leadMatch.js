import express from "express";
import { createLeadMatchCMS ,getLeadMatchCMS,updateLeadMatchCMS} from "../../../controller/CMS/leadMatch.js";

const leadMatchCMS = express.Router();



leadMatchCMS.post("/v1/createLeadMatch", createLeadMatchCMS);
leadMatchCMS.get("/v1/getLeadMatch", getLeadMatchCMS);
leadMatchCMS.put("/v1/updateLeadMatch", updateLeadMatchCMS);





export default leadMatchCMS;


