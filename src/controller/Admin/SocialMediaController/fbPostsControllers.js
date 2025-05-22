import { ApiResponse } from "../../../utils/ApiResponse/ApiResponse.js";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const createMrfranchiseFbPagePosts = async (req, res) => {
  try {
    const { message, postID, token } = req.body;
    console.log("=============== ;",req.body)

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const accessToken = token || process.env.FB_POST_TOKEN;
    const ID = postID || process.env.FB_POST_ID;

    if (!accessToken || !ID) {
      return res.json(
        new ApiResponse(400, null, "Access token or post ID is missing")
      );
    }

    const imageLocalPath = req?.files?.image?.[0]?.path;
    const videoLocalPath = req?.files?.video?.[0]?.path;

    if (imageLocalPath && videoLocalPath) {
      return res.json(
        new ApiResponse(400, null, "Please upload either an image or a video, not both.")
      );
    }

    let fbURL;
    const form = new FormData();

    form.append("access_token", accessToken);

    if (imageLocalPath) {
    if (!fs.existsSync(imageLocalPath)) {
        return res.status(400).json({ error: "Image file not found on server." });
    }

    fbURL = `https://graph.facebook.com/v12.0/${ID}/photos`;
    form.append("caption", message);
    form.append("source", fs.createReadStream(imageLocalPath));
    } else if (videoLocalPath) {
    if (!fs.existsSync(videoLocalPath)) {
        return res.status(400).json({ error: "Video file not found on server." });
    }

    fbURL = `https://graph.facebook.com/v12.0/${ID}/videos`;
    form.append("description", message);
    form.append("source", fs.createReadStream(videoLocalPath));
    } else {
      // Text-only post
      fbURL = `https://graph.facebook.com/v12.0/${ID}/feed`;
      form.append("message", message);
    }

    const response = await axios.post(fbURL, form, {
      headers: form.getHeaders(),
    });

    try {
        if (imageLocalPath) fs.unlinkSync(imageLocalPath);
        if (videoLocalPath) fs.unlinkSync(videoLocalPath);
        } catch (cleanupErr) {
        console.warn("File cleanup error:", cleanupErr.message);
        }

    return res.json(
        new ApiResponse(200,response.data,"post created successfully")
    );
  } catch (error) {
    console.error("Facebook API error:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Failed to create Facebook post.",
      details: error.response?.data || error.message,
    });
  }
};


const getAllMrfranchiseFbPagePosts = async (req, res) => {
  try {
    const { token, postID } = req?.body || '';

    const accessToken = token || process.env.FB_POST_TOKEN;
    const ID = postID || process.env.FB_POST_ID;

    if (!accessToken || !ID) {
      return res.json(
        new ApiResponse(400, null, "Access token or post ID is missing")
      );
    }

    const fbURL = `https://graph.facebook.com/v12.0/${ID}/posts`;

    const response = await axios.get(fbURL, {
      params: {
        access_token: accessToken,
      },
    });

    return res.status(200).json(
      new ApiResponse(200, response.data, "All Facebook posts fetched successfully")
    );
  } catch (error) {
    console.error("Facebook API error:", error.response?.data || error.message);

    return res.status(500).json(
      new ApiResponse(
        500,
        null,
        "Failed to fetch Facebook posts",
        error.response?.data || error.message
      )
    );
  }
};

const deleteMrfranchiseFbPagePostsByID = async (req, res) => {
  try {
    const { postID, token } = req.body || {};

    if (!postID) {
      return res.status(400).json(
        new ApiResponse(400, null, "Post ID is required.")
      );
    }

    const accessToken = token || process.env.FB_POST_TOKEN;

    if (!accessToken) {
      return res.status(400).json(
        new ApiResponse(400, null, "Access token is missing.")
      );
    }

    const fbURL = `https://graph.facebook.com/v12.0/${postID}`;

    const response = await axios.delete(fbURL, {
      params: {
        access_token: accessToken,
      },
    });

    if (!response.data || response.data.error) {
      return res.status(400).json(
        new ApiResponse(400, null, "Failed to delete the post.")
      );
        
    }
    console.log( response)

      return res.status(200).json(
        new ApiResponse(200,  response.data, "Post deleted successfully.")
      )
  } catch (error) {
    const fbError = error.response?.data?.error;

  
    console.error("Facebook API error:", fbError || error.message);

  
    if (fbError?.code === 100 && fbError?.error_subcode === 33) {
      return res.status(404).json(
        new ApiResponse(
          404,
          null,
          "Post not found or you don't have permission to delete it. Make sure the access token is from the page that created the post."
        )
      );
    }

    return res.status(500).json(
      new ApiResponse(
        500,
        null,
        "Failed to delete Facebook post.",
        fbError || error.message
      )
    );
  }
};



export { createMrfranchiseFbPagePosts,getAllMrfranchiseFbPagePosts,deleteMrfranchiseFbPagePostsByID };
