
import fs from 'fs/promises';
import { existsSync } from 'fs'; // <-- add this for sync file check
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
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
export const uploadFileToS3 = async (filePath, mimetype = null) => {
  // Check if the file exists
  if (!existsSync(filePath)) {
    console.error(`❌ File does not exist at path: ${filePath}`);
    throw new Error(`File not found at ${filePath}`);
  }

  const originalFileName = path.basename(filePath);
  const ext = path.extname(originalFileName);
  const baseName = path.basename(originalFileName, ext);

  const contentType = mimetype || mime.lookup(ext) || 'application/octet-stream';

  // Folder based on content type
  const folder = contentType.startsWith('image/')
    ? 'images'
    : contentType.startsWith('video/')
    ? 'videos'
    : contentType.startsWith('application/')
    ? 'documents'
    : 'misc';

  const fileKey = `${folder}/${Date.now()}-${baseName}${ext}`;

  try {
    const fileContent = await fs.readFile(filePath);

    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: fileKey,
      Body: fileContent,
      ContentType: contentType,
      // ACL: 'public-read' // Optional: Uncomment if public access is needed
    });

    await s3.send(command);
    // console.log(`✅ Uploaded to S3: ${fileKey}`);

    // Try deleting the local file
    try {
      await fs.unlink(filePath);
      // console.log(`🗑️ Deleted local temp file: ${filePath}`);
    } catch (unlinkErr) {
      console.warn(`⚠️ Could not delete temp file: ${unlinkErr.message}`);
    }

    // Construct public S3 URL
    const s3Url = `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    return s3Url;

  } catch (err) {
    console.error('❌ Upload to S3 failed:', err.message);
    throw new Error('Failed to upload file to S3');
  }
};


export const uploadFileToR2 = async (filePath, mimetype) => {
  if (!filePath) {
    throw new Error("File path is required");
  }

  try {
    // Verify file exists and is accessible
    if (!existsSync(filePath)) {
      throw new Error(`File not found at ${filePath}`);
    }

    // Get file stats to verify it's not empty
    const stats = await fs.stat(filePath);
    if (stats.size === 0) {
      await fs.unlink(filePath); // Remove empty file immediately
      throw new Error(`Empty file at ${filePath}`);
    }

    const originalFileName = path.basename(filePath);
    const ext = path.extname(originalFileName).toLowerCase();
    const baseName = path.basename(originalFileName, ext);

    // Determine content type
    const contentType = mimetype || mime.lookup(ext) || 'application/octet-stream';

    // Organize files by type
    const folder = contentType.startsWith('image/') ? 'images' :
                   contentType.startsWith('video/') ? 'videos' :
                   contentType.startsWith('audio/') ? 'audio' :
                   contentType.startsWith('application/') ? 'documents' :
                   'misc';

    const fileKey = `${folder}/${Date.now()}-${baseName}${ext}`;

    console.log("fileKey :",fileKey)

    // Read file content
    const fileContent = await fs.readFile(filePath);

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      Body: fileContent,
      ContentType: contentType,
    });

    await s3.send(command);

    // Delete local file after successful upload
    try {
      // await fs.unlink(filePath);
      console.log(`✅ Successfully cleaned up temporary file: ${filePath}`);
    } catch (unlinkErr) {
      console.error(`⚠️ Failed to delete temp file: ${filePath}`, unlinkErr.message);
      // Don't throw error here - upload succeeded, just log the cleanup failure
    }

    // Return public URL
    if (process.env.R2_PUBLIC_URL) {
      const baseUrl = process.env.R2_PUBLIC_URL.replace(/\/$/, '');
      return `${baseUrl}/${fileKey}`;
    }
    return fileKey;
    
  } catch (error) {
    // Attempt to clean up the file even if upload failed
    if (existsSync(filePath)) {
      try {
        // await fs.unlink(filePath);
        console.log(`🧹 Cleaned up failed upload file: ${filePath}`);
      } catch (cleanupError) {
        console.error(`⚠️ Failed to clean up failed upload file: ${filePath}`, cleanupError.message);
      }
    }
    
    console.error("❌ uploadFileToR2 Error:", error.message);
    throw error; // Re-throw the original error after cleanup attempts
  }
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

export const deleteFileFromR2 = async (fileKey) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey,
  });

  try {
    await s3.send(command);
    // console.log(`✅ File "${fileKey}" deleted successfully from R2.`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error deleting file from R2:`, error.message);
    throw new Error('Failed to delete file from R2');
  }
};