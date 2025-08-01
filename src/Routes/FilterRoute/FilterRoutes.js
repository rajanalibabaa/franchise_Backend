
import { Router } from "express";
import { getAllBrandsAndFilter,getAllBrandFiltersdata } from "../../controller/Filter/filterController.js";


export const filterRouter = Router();


filterRouter.post("/v1/filter/getAllBrandsAndFilter", getAllBrandsAndFilter);
filterRouter.post("/v1/filter/getAllBrandFiltersdata", getAllBrandFiltersdata);