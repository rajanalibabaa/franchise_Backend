// social.controller.js
import { postToAllPlatforms } from "./socialmediapost.js";

export async function createCrossPost(req, res) {
  const { message, mediaUrl, title, description } = req.body;

  try {
    const results = await postToAllPlatforms({ message, mediaUrl, title, description });
    return res.status(200).json({ success: true, results });
  } catch (error) {
    console.error("Cross-post error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
