import { Router } from 'express';
import {
  createPostRequirement,
  getAllPostRequirement,
  getPostRequirementById,
  getPostRequirementByUUID,
  updatePostRequirement,
  deletePostRequirement
} from '../controller/PostRequirement/postRequirementController.js';

import { validatePostRequirement } from '../Middleware/validatePostRequirement.js'

import {preprocessInvestmentRange} from '../Middleware/preprocessInvestmentRange.js'
const router = Router();

router.post('/createPostRequirement', validatePostRequirement, createPostRequirement,preprocessInvestmentRange);
router.get('/getPostRequirement', getAllPostRequirement);
router.get('/getPostRequirement/id/:id', getPostRequirementById);
router.get('/getPostRequirement/Uuid/:uuid', getPostRequirementByUUID);
router.put('/getPostRequirement/id/:id', validatePostRequirement, updatePostRequirement,preprocessInvestmentRange);
router.put('/getPostRequirement/Uuid/:uuid', validatePostRequirement, updatePostRequirement,preprocessInvestmentRange);
router.delete('/getPostRequirement/id/:id', deletePostRequirement);
export default router;
