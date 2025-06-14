
import fs from 'fs/promises';
import { existsSync } from 'fs'; // <-- add this for sync file check
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import s3 from './s3.js';
import dotenv from 'dotenv';
import path from 'path';
import { readFile, unlink } from 'fs/promises';
import mime from 'mime-types';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

dotenv.config();

/**
 * Uploads a file to AWS S3 with content type and auto folder based on media type
 * @param {string} filePath - Local path of the file to upload
 * @param {string} mimetype - MIME type of the file (optional)
 * @returns {string} - Public URL of the uploaded S3 object
 */
export const uploadFileToS3 = async (filePath, mimetype = 'application/octet-stream') => {
  const originalFileName = path.basename(filePath);
  const ext = path.extname(originalFileName);
  const baseName = path.basename(originalFileName, ext);

  // Use mime-type lib for accuracy if not provided
  const contentType = mimetype || mime.lookup(filePath) || 'application/octet-stream';

  // Folder naming: images/, videos/, documents/ etc.
  const folder =
    contentType.startsWith('image/') ? 'images' :
    contentType.startsWith('video/') ? 'videos' :
    contentType.startsWith('application/') ? 'documents' :
    'misc';

  const fileKey = `${folder}/${Date.now()}-${baseName}${ext}`;

  try {
    if (!existsSync(filePath)) {
    console.error(`❌ File does not exist at path: ${filePath}`);
    throw new Error(`File not found at ${filePath}`);
  }
    const fileContent = await fs.readFile(filePath);

    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: fileKey,
      Body: fileContent,
      ContentType: contentType,
      // ACL: 'public-read', // Optional: Makes the file public
    });

    await s3.send(command);
    console.log(`✅ Uploaded to S3: ${fileKey}`);

    // Delete local file after upload
    try {
      await fs.unlink(filePath);
      console.log(`🗑️ Deleted local temp file: ${filePath}`);
    } catch (unlinkErr) {
      console.warn(`⚠️ Failed to delete temp file: ${unlinkErr.message}`);
    }

    // Return full public URL (can be used in frontend)
    const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    return s3Url;

  } catch (err) {
    console.error('❌ Upload to S3 failed:', err.message);
    throw new Error('Failed to upload file to S3');
  }
};


export const uploadFileToR2 = async (filePath, mimetype) => {
  const originalFileName = path.basename(filePath);
  const ext = path.extname(originalFileName);
  const baseName = path.basename(originalFileName, ext);

  const contentType = mimetype || mime.lookup(filePath) || 'application/octet-stream';

  const folder =
    contentType.startsWith('image/') ? 'images' :
    contentType.startsWith('video/') ? 'videos' :
    contentType.startsWith('application/') ? 'documents' :
    'misc';

  const fileKey = `${folder}/${Date.now()}-${baseName}${ext}`;

  if (!existsSync(filePath)) {
    throw new Error(`File not found at ${filePath}`);
  }

  const fileContent = await readFile(filePath);

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey,
    Body: fileContent,
    ContentType: contentType,
  });

  await s3.send(command);
  console.log(`✅ Uploaded to R2: ${fileKey}`);

  try {
    await unlink(filePath); // using fs.promises.unlink properly
    console.log(`🗑️ Deleted local temp file: ${filePath}`);
  } catch (unlinkErr) {
    console.warn(`⚠️ Failed to delete temp file: ${unlinkErr.message}`);
  }

  const r2Url = `${process.env.R2_PUBLIC_URL}/${fileKey}`;
  return r2Url;
};


export const generateSignedUrl = async (fileKey, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey,
  });

  try {
    return await getSignedUrl(s3, command, { expiresIn });
  } catch (error) {
    console.error("❌ Error generating signed URL:", error.message);
    throw error;
  }
};