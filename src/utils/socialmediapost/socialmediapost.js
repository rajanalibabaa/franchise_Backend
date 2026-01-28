// socialPost.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const FB_PAGE_ID = process.env.FB_PAGE_ID;
const IG_USER_ID = process.env.IG_USER_ID;

const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const LINKEDIN_URN = process.env.LINKEDIN_URN;

async function postToFacebook(message, mediaUrl) {
  try {
    if (!mediaUrl) {
      const res = await axios.post(
        `https://graph.facebook.com/v23.0/${FB_PAGE_ID}/feed`,
        null,
        { params: { message, access_token: FB_PAGE_ACCESS_TOKEN } },
      );
      return res.data;
    }

    const isVideo = /\.(mp4|mov|avi|mkv)$/i.test(mediaUrl);
    const endpoint = isVideo ? "videos" : "photos";

    const res = await axios.post(
      `https://graph.facebook.com/v23.0/${FB_PAGE_ID}/${endpoint}`,
      null,
      {
        params: {
          url: mediaUrl,
          caption: message,
          access_token: FB_PAGE_ACCESS_TOKEN,
        },
      },
    );
    return res.data;
  } catch (error) {
    return { error: error.response?.data || error.message };
  }
}

async function postToInstagram(message, mediaUrl) {
  try {
    if (!mediaUrl) {
      return { error: "Instagram requires media." };
    }

    const isVideo = /\.(mp4|mov|avi|mkv)$/i.test(mediaUrl);

    const mediaParams = isVideo
      ? { media_type: "VIDEO", video_url: mediaUrl, caption: message }
      : { image_url: mediaUrl, caption: message };

    // Step 1: Create container
    const createRes = await axios.post(
      `https://graph.facebook.com/v23.0/${IG_USER_ID}/media`,
      null,
      { params: { ...mediaParams, access_token: FB_PAGE_ACCESS_TOKEN } },
    );

    // Step 2: Publish
    const publishRes = await axios.post(
      `https://graph.facebook.com/v23.0/${IG_USER_ID}/media_publish`,
      null,
      {
        params: {
          creation_id: createRes.data.id,
          access_token: FB_PAGE_ACCESS_TOKEN,
        },
      },
    );

    return publishRes.data;
  } catch (error) {
    return { error: error.response?.data || error.message };
  }
}

/* ============================
   LinkedIn
=============================== */
async function postToLinkedIn(message, mediaUrl, title, description) {
  try {
    const payload = {
      author: LINKEDIN_URN,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: message },
          shareMediaCategory: mediaUrl ? "IMAGE" : "NONE",
          media: mediaUrl
            ? [
                {
                  status: "READY",
                  originalUrl: mediaUrl,
                  title: title ? { text: title } : undefined,
                  description: description ? { text: description } : undefined,
                },
              ]
            : [],
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    };

    const res = await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      payload,
      {
        headers: {
          Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      },
    );

    return res.data;
  } catch (error) {
    return { error: error.response?.data || error.message };
  }
}

/* ============================
   Unified Function
=============================== */
export async function postToAllPlatforms({
  message,
  mediaUrl,
  title,
  description,
}) {
  return {
    facebook: await postToFacebook(message, mediaUrl),
    instagram: await postToInstagram(message, mediaUrl),
    linkedin: await postToLinkedIn(message, mediaUrl, title, description),
  };
}
