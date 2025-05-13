import { Router } from 'express';
import {
  createPostRequirement,
  getAllPostRequirement,
  getPostRequirementById,
  getPostRequirementByUUID,
  updatePostRequirement,
  deletePostRequirement,
} from '../../controller/PostRequirement/postRequirementController.js';

import { validatePostRequirement } from '../../Validation/PostRequirementListing/PostRequirementListing.js';
import { preprocessInvestmentRange } from '../../Middleware/PostRequirementMiddleware/preprocessInvestmentRange.js';

const router = Router();

// RESTful Routes
router.post(
  '/postRequirements',
  preprocessInvestmentRange,
  validatePostRequirement,
  createPostRequirement
);

router.get('/postRequirements', getAllPostRequirement);
router.get('/postRequirements/:id', getPostRequirementById);
router.get('/postRequirements/uuid/:uuid', getPostRequirementByUUID); // (or use query params)

router.put(
  '/postRequirements/:id',
  preprocessInvestmentRange,
  validatePostRequirement,
  updatePostRequirement
);

router.delete('/postRequirements/:id', deletePostRequirement);

export default router;