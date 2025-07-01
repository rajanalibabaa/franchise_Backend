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
  '/post/postRequirements',
  preprocessInvestmentRange,
  validatePostRequirement,
  createPostRequirement
);

router.get('/post/postRequirements', getAllPostRequirement);
router.get('/post/postRequirements/:id', getPostRequirementById);
router.get('/post/postRequirements/uuid/:uuid', getPostRequirementByUUID); // (or use query params)

router.put(
  '/postRequirements/:id',
  preprocessInvestmentRange,
  validatePostRequirement,
  updatePostRequirement
);

router.delete('/post/postRequirements/:id', deletePostRequirement);

export default router;