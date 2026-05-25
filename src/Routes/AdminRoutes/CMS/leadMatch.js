import express from "express";
import { createLeadMatchCMS ,getLeadMatchCMS} from "../../../controller/CMS/leadMatch.js";

const leadMatchCMS = express.Router();



leadMatchCMS.post("/v1/createLeadMatch", createLeadMatchCMS);
leadMatchCMS.get("/v1/getLeadMatch", getLeadMatchCMS);





export default leadMatchCMS;


