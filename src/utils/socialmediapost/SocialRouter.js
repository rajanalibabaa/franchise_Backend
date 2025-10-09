// social.routes.js
import express from "express";
import { createCrossPost } from "./SocialCrossPlatformController.js";

const router = express.Router();

// POST /api/social/post -> posts to FB, IG, LinkedIn
router.post("/social/post", createCrossPost);

export default router;
