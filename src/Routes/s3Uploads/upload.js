// routes/upload.js
import express from 'express';
import fs from 'fs';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3 from '../../utils/Uploads/s3.js';
// import upload from '../../utils/Uploads/multerConfig.js';
import { addTextWatermarkToImage} from "../../utils/Uploads/imageProcessor.js"; // Assuming this is where image processing logic is defined
import { addTextWatermarkToVideo} from "../../utils/Uploads/videoProcessor.js"; // Assuming this is where image processing logic is defined
import dotenv from 'dotenv';
import {transcodeToHLS} from "../../utils/Uploads/videoTranscoder.js"
import {uploadHLSFolder} from "../../utils/Uploads/uploadHLSFolder.js"

dotenv.config();

const router = express.Router();

// ✅ MULTIPLE FILE UPLOAD
// router.post('/media/multiple', upload.array('files', 10), async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ error: 'No files uploaded' });
//     }

//     const watermarkText = 'www.MrFranchise.in';

//     // Create a list of promises for concurrent uploads
//     const uploadPromises = req.files.map(async (file) => {
//       let processedPath = file.path;

//       if (file.mimetype.startsWith('image/')) {
//         // Process image (e.g., add watermark)
//         processedPath = await addTextWatermarkToImage(file.path, watermarkText);
//       } else if (file.mimetype.startsWith('video/')) {
//         // Process video (e.g., add watermark)
//         processedPath = await addTextWatermarkToVideo(file.path, watermarkText);
//       }
//       const fileContent = fs.readFileSync(processedPath);
//  const fileKey = `${Date.now()}-${file.originalname.replace(/\.(jpg|jpeg|png|webp|gif|mp4|mov)$/, processedPath.endsWith('.webp') ? '.webp' : '.mp4')}`;

//       const command = new PutObjectCommand({
//         Bucket: process.env.S3_BUCKET_NAME,
//         Key: fileKey,
//         Body: fileContent,
//         ContentType: file.mimetype,
//       });

//       await s3.send(command);

//       // Clean up local file
//        fs.unlinkSync(file.path);
//       if (processedPath !== file.path) {
//         fs.unlinkSync(processedPath);
//       }

//       const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
//       return fileUrl;
//     });

//     // Wait for all files to upload
//     const uploadedUrls = await Promise.all(uploadPromises);

//     res.status(200).json({
//       message: 'Multiple upload successful',
//       urls: uploadedUrls,
//     });

//   } catch (err) {
//     console.error('Upload error:', err);
//     res.status(500).json({ error: 'Failed to upload files' });
//   }
// });


// router.post("/process-video", async (req, res) => {
//   try {
//     const { localFilePath, videoId } = req.body;
//     if (!localFilePath || !videoId)
//       return res.status(400).json({ error: "Missing file path or videoId" });

//     const outputDir = path.join("tmp_hls", videoId);
//     if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

//     // 1. Convert mp4 -> HLS
//     const masterPlaylist = await transcodeToHLS(localFilePath, outputDir);

//     // 2. Upload folder to R2
//     const playbackUrl = await uploadHLSFolder(outputDir, `videos/${videoId}`);

//     // 3. Cleanup local
//     fs.rmSync(outputDir, { recursive: true, force: true });

//     return res.json({ success: true, playbackUrl });
//   } catch (err) {
//     console.error("❌ Video processing failed:", err);
//     res.status(500).json({ error: "Video processing failed" });
//   }
// });



export default router;
