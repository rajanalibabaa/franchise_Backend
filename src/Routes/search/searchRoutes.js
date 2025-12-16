
import { Router } from "express";
import { searchSuggestions } from "../../controller/search/searchTermController.js";

export const searchRoutes = Router()

searchRoutes.get('/v1/search/',searchSuggestions) 