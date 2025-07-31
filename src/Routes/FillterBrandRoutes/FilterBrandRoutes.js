import express from "express";
import {getAllBrandsAndFilter}  from "../../controller/Filter/filterController.js";



export const filterRouter = express.Router();




filterRouter.get("/v1/filter/getAllBrandsAndFilter", getAllBrandsAndFilter);

