import express from "express";
import {leadPackageUpdate} from "../../controller/LeadPackageController/LeadPackage.js"



const leadPackageRouter=express.Router();

leadPackageRouter.put("/v1/leadPackageUpdate/:id", leadPackageUpdate);

export default leadPackageRouter;