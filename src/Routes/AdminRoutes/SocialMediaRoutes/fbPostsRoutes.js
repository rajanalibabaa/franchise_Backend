import express from "express";
import { createMrfranchiseFbPagePosts, deleteMrfranchiseFbPagePostsByID, getAllMrfranchiseFbPagePosts } from "../../../controller/Admin/SocialMediaController/fbPostsControllers.js";
import upload from "../../../utils/Uploads/multerConfig.js";


export const fbPostsRouter = express.Router();

fbPostsRouter.post("/v1/socialmedia/fb/createFbPost",upload.fields([
    { name : 'image',maxCount: 1 },
    { name : 'video',maxCount: 1 },
]), createMrfranchiseFbPagePosts)

fbPostsRouter.get("/v1/socialmedia/fb/getAllMrfranchiseFbPagePosts",getAllMrfranchiseFbPagePosts)
fbPostsRouter.delete("/v1/socialmedia/fb/deleteMrfranchiseFbPagePostsByID",deleteMrfranchiseFbPagePostsByID)

 
 