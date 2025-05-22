import express from "express";
import { createMrfranchiseFbPagePosts, deleteMrfranchiseFbPagePostsByID, getAllMrfranchiseFbPagePosts } from "../../../controller/Admin/SocialMediaController/fbPostsControllers.js";
import upload from "../../../utils/Uploads/multerConfig.js";


export const fbPostsRouter = express.Router();

fbPostsRouter.post("/createFbPost",upload.fields([
    { name : 'image',maxCount: 1 },
    { name : 'video',maxCount: 1 },
]), createMrfranchiseFbPagePosts)

fbPostsRouter.get("/getAllMrfranchiseFbPagePosts",getAllMrfranchiseFbPagePosts)
fbPostsRouter.delete("/deleteMrfranchiseFbPagePostsByID",deleteMrfranchiseFbPagePostsByID)

 
 