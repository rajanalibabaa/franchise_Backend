import { Router } from 'express';

import { verifyJWT } from '../../Middleware/Authentication/authMiddleware.js';
import { postViewBrands } from '../../controller/ViewedBrands/ViewedBrandsControllers.js';

export const ViewedBrandsRouter = Router();

ViewedBrandsRouter.post("/postViewBrands/:id",verifyJWT,postViewBrands)



