import { Router } from 'express';
import {
  createPostRequirement,
  getAllPostRequirement,
  getPostRequirementById,
  getPostRequirementByUUID,
  updatePostRequirement,
  deletePostRequirement,
} from '../controller/PostRequirement/postRequirementController.js';

import { validatePostRequirement } from '../Validation/PostRequirementListing/PostRequirementListing.js';
import { preprocessInvestmentRange } from '../Middleware/PostRequirementMiddleware/preprocessInvestmentRange.js';

const router = Router();

// Routes
router.post(
  '/createPostRequirement',
  preprocessInvestmentRange, // Preprocess first
  validatePostRequirement, // Validate after preprocessing
  createPostRequirement
);

router.get('/getPostRequirement', getAllPostRequirement);
router.get('/getPostRequirement/id/:id', getPostRequirementById);
router.get('/getPostRequirement/uuid/:uuid', getPostRequirementByUUID);

router.put(
  '/updatePostRequirement/id/:id',
  preprocessInvestmentRange, // Preprocess first
  validatePostRequirement, // Validate after preprocessing
  updatePostRequirement
);

router.delete('/deletePostRequirement/id/:id', deletePostRequirement);

export default router;