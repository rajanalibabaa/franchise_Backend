import { Router } from "express";
import {
  getAllBrandsAndFilter,
  getAllBrandFiltersdata,
//   getAllFoodAndBeverageCategoryBrandsAndFilter,
} from "../../controller/Filter/filterController.js";

export const filterRouter = Router();

filterRouter.get("/v1/filter/getAllBrandsAndFilter", getAllBrandsAndFilter);
filterRouter.post("/v1/filter/getAllBrandFiltersdata", getAllBrandFiltersdata);
// filterRouter.get(
//   "/v1/filter/getAllFoodAndBeverageCategoryBrandsAndFilter",
//   getAllFoodAndBeverageCategoryBrandsAndFilter
// );
