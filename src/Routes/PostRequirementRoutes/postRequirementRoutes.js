import { Router } from "express";
import {
  createPostRequirement,
  getAllPostRequirement,
  getPostRequirementById,
  getPostRequirementByUUID,
  updatePostRequirement,
  deletePostRequirement,
} from "../../controller/PostRequirement/postRequirementController.js";

import { preprocessInvestmentRange } from "../../Middleware/PostRequirementMiddleware/preprocessInvestmentRange.js";

const router = Router();

// RESTful Routes
router.post(
  "/post/postRequirements",
  preprocessInvestmentRange,
  createPostRequirement,
);

router.get("/v1/post/postRequirements", getAllPostRequirement);
router.get("/v1/post/postRequirements/:id", getPostRequirementById);
router.get("/v1/post/postRequirements/uuid/:uuid", getPostRequirementByUUID); // (or use query params)

router.put(
  "/postRequirements/:id",
  preprocessInvestmentRange,
  updatePostRequirement,
);

router.delete("/v1/post/postRequirements/:id", deletePostRequirement);

export default router;
