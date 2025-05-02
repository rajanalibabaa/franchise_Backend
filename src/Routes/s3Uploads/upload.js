// routes/upload.js
import express from 'express';
import fs from 'fs';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3 from '../../utils/Uploads/s3.js';
import upload from '../../utils/Uploads/multerConfig.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// ✅ MULTIPLE FILE UPLOAD
router.post('/media/multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Create a list of promises for concurrent uploads
    const uploadPromises = req.files.map(async (file) => {
      const fileContent = fs.readFileSync(file.path);
      const fileKey = `${Date.now()}-${file.originalname}`;

      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        Body: fileContent,
        ContentType: file.mimetype,
      });

      await s3.send(command);

      // Clean up local file
      fs.unlinkSync(file.path);

      const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
      return fileUrl;
    });

    // Wait for all files to upload
    const uploadedUrls = await Promise.all(uploadPromises);

    res.status(200).json({
      message: 'Multiple upload successful',
      urls: uploadedUrls,
    });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

export default router;
