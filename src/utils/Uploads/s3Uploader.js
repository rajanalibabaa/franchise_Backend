import fs from 'fs/promises';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3 from './s3.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const uploadFileToS3 = async (filePath, mimetype = 'application/octet-stream') => {
  const fileName = path.basename(filePath);
  const fileKey = `${Date.now()}-${fileName}`;

  try {
    const fileContent = await fs.readFile(filePath);

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
      Body: fileContent,
      ContentType: mimetype,
    });

    await s3.send(command);
    console.log(`✅ Uploaded to S3: ${fileKey}`);

  
    try {
      await fs.unlink(filePath);
      console.log(`🗑️ Deleted local temp file: ${filePath}`);
    } catch (unlinkErr) {
      console.warn(`⚠️ Failed to delete temp file: ${unlinkErr.message}`);
    }

    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
  } catch (err) {
    console.error('❌ Upload failed:', err.message);
    throw new Error('Failed to upload file to S3');
  }
};
