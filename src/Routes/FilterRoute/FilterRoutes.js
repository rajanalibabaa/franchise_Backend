
import { Router } from "express";
import { getAllBrandsAndFilter } from "../../controller/Filter/filterController.js";


export const filterRouter = Router();


filterRouter.post("/v1/filter/getAllBrandsAndFilter", getAllBrandsAndFilter);
