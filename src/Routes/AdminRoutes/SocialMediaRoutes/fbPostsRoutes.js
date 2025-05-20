import express from "express";
import { createFbPost } from "../../../controller/Admin/SocialMediaController/fbPostsControllers.js";


export const fbPostsRouter = express.Router();

fbPostsRouter.post("/createFbPost",createFbPost)


 
 