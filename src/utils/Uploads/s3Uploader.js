
// import * as fsp from "fs/promises";
// import fs, { existsSync } from "fs"; // for sync methods
// import { exec,spawn } from "child_process";
// import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
// import s3 from './s3.js';
// import dotenv from 'dotenv';
// import path from 'path';
// import mime from 'mime-types';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { console } from 'inspector';
// import util from "util";
// dotenv.config();

// // ✅ Helper: build public URL from uploads folder
// function getPublicUploadUrl(filename) {
//   const serverUrl = process.env.SERVER_URL || "http://localhost:5000";
//   return `${serverUrl}/uploads/${filename}`;
// }
 
// // ✅ Helper: safely delete a file
// // Safely delete a file if it exists
// async function safeUnlink(filePath) {
//   try {
//     if (existsSync(filePath)) {
//       await fsp.unlink(filePath);
//       console.log(`🗑️ Deleted: ${filePath}`);
//     }
//   } catch (err) {
//     console.warn(`⚠️ Could not delete file ${filePath}: ${err.message}`);
//   }
// }


// /**
//  * Uploads a file to AWS S3 with content type and auto folder based on media type
//  * @param {string} filePath - Local path of the file to upload
//  * @param {string} mimetype - MIME type of the file (optional)
//  * @returns {string} - Public URL of the uploaded S3 object
//  */
// export const uploadFileToS3 = async (filePath, mimetype = null) => {
//   // Check if the file exists
//   if (!existsSync(filePath)) {
//     console.error(`❌ File does not exist at path: ${filePath}`);
//     throw new Error(`File not found at ${filePath}`);
//   }

//   const originalFileName = path.basename(filePath);
//   const ext = path.extname(originalFileName);
//   const baseName = path.basename(originalFileName, ext);

//   const contentType = mimetype || mime.lookup(ext) || 'application/octet-stream';

//   // Folder based on content type
//   const folder = contentType.startsWith('image/')
//     ? 'images'
//     : contentType.startsWith('video/')
//     ? 'videos'
//     : contentType.startsWith('application/')
//     ? 'documents'
//     : 'misc';

//   const fileKey = `${folder}/${Date.now()}-${baseName}${ext}`;

//   try {
//     const fileContent = await fs.readFile(filePath);

//     const command = new PutObjectCommand({
//       Bucket: process.env.BUCKET_NAME,
//       Key: fileKey,
//       Body: fileContent,
//       ContentType: contentType,
//       // ACL: 'public-read' // Optional: Uncomment if public access is needed
//     });

//     await s3.send(command);
//     // console.log(`✅ Uploaded to S3: ${fileKey}`);

//     // Try deleting the local file
//     try {
//       await fs.unlink(filePath);
//       // console.log(`🗑️ Deleted local temp file: ${filePath}`);
//     } catch (unlinkErr) {
//       console.warn(`⚠️ Could not delete temp file: ${unlinkErr.message}`);
//     }

//     // Construct public S3 URL
//     const s3Url = `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
//     return s3Url;

//   } catch (err) {
//     console.error('❌ Upload to S3 failed:', err.message);
//     throw new Error('Failed to upload file to S3');
//   }
// };


// function runFFmpeg(args) {
//   return new Promise((resolve, reject) => {
//     const ffmpegBin = process.env.FFMPEG_PATH || "ffmpeg";
//     const p = spawn(ffmpegBin, args, { windowsHide: true });

//     let stderr = "";
//     p.stderr.on("data", d => {
//       stderr += d.toString();
//       console.log("FFmpeg:", d.toString());
//     });

//     p.on("error", reject);
//     p.on("close", code => code === 0 ? resolve() : reject(new Error(`FFmpeg exited with code ${code}\n${stderr}`)));
//   });
// }


// // helper: recursive uploader (keeps folders)
// async function uploadDirToR2(localDir, r2Prefix) {
//   const entries = fs.readdirSync(localDir, { withFileTypes: true });
//   for (const entry of entries) {
//     const full = path.join(localDir, entry.name);
//     const key = `${r2Prefix}/${entry.name}`;
//     if (entry.isDirectory()) {
//       await uploadDirToR2(full, key);
//     } else {
//       const buf = await fsp.readFile(full);
//       const type = entry.name.endsWith(".m3u8")
//         ? "application/vnd.apple.mpegurl"
//         : "video/mp2t";
//       await s3.send(new PutObjectCommand({
//         Bucket: process.env.R2_BUCKET_NAME,
//         Key: key,
//         Body: buf,
//         ContentType: type,
//       }));
//       console.log("📤 Uploaded:", key);
//     }
//   }
// }



// export const uploadFileToR2 = async (filePath, mimetype, options = {}) => {
//   const { convertToHLS = false, videoId = null } = options;

//   if (!existsSync(filePath)) throw new Error(`File not found: ${filePath}`);

//   const absInput = path.resolve(filePath);
//   const ext = path.extname(absInput).toLowerCase();
//   const baseName = path.basename(absInput, ext);
//   const contentType = mimetype || "video/mp4";

//   // 🎥 Video → HLS
//   if (contentType.startsWith("video/") && convertToHLS) {
//     try { await runFFmpeg(["-version"]); } 
//     catch { throw new Error("FFmpeg not installed or not in PATH."); }

//     // ✅ stable output folder if videoId provided else use Date.now()
//     const id = videoId || Date.now().toString(); 
//     const hlsDir = path.resolve("uploads", "hls", id);

//     // ✅ Remove old folder if exists (for re-upload)
//     if (existsSync(hlsDir)) {
//       await fsp.rm(hlsDir, { recursive: true, force: true });
//     }
//     await fsp.mkdir(hlsDir, { recursive: true });

//     const args = [
//       "-y",
//       "-i", absInput,
//       "-preset", "veryfast",
//       "-c:v", "libx264",
//       "-c:a", "aac",
//       "-f", "hls",
//       "-hls_time", "6",
//       "-hls_playlist_type", "vod",
//       "-hls_segment_filename", path.join(hlsDir, "seg_%03d.ts"),
//       path.join(hlsDir, "prog_index.m3u8"),
//     ];

//     await runFFmpeg(args);
//     await safeUnlink(absInput); // ✅ delete uploaded source

//     const publicUrl = `${process.env.SERVER_URL || "http://localhost:5000"}/uploads/hls/${id}/prog_index.m3u8`;
//     console.log("✅ HLS ready at:", publicUrl);

//     return publicUrl;
//   }

// // 📂 Direct upload fallback (image/docs)
// const uploadsDir = path.resolve("uploads");
// await fsp.mkdir(uploadsDir, { recursive: true });

// const newFileName = `${Date.now()}-${baseName}${ext}`;
// const destPath = path.join(uploadsDir, newFileName);

// // ✅ Move file into uploads folder
// if (absInput !== destPath) {
//   await fsp.copyFile(absInput, destPath);
// }

// // Delete temp input file
// await safeUnlink(absInput);

// // ✅ Always return public URL (NOT absInput)
// const publicUrl = getPublicUploadUrl(newFileName);
// console.log("✅ Uploaded image available at:", publicUrl);
// return publicUrl;

// };



// export const generateSignedUrl = async (fileKey, expiresIn = 3600) => {
//   const command = new GetObjectCommand({
//     Bucket: process.env.R2_BUCKET_NAME,
//     Key: fileKey,
//   });

//   try {
//     return await getSignedUrl(s3, command, { expiresIn });
//   } catch (error) {
//     console.error("❌ Error generating signed URL:", error.message);
//     throw error;
//   }
// };

// export const deleteFileFromR2 = async (filePathOrUrl) => {
//   if (!filePathOrUrl) throw new Error("File path or key is required");

//   const baseUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "") || "";
//   const fileKey = filePathOrUrl.startsWith("http")
//     ? filePathOrUrl.replace(baseUrl + "/", "")
//     : filePathOrUrl;

//   try {
//     await s3.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: fileKey }));
//     console.log(`✅ Deleted from R2: ${fileKey}`);
//     return { success: true };
//   } catch (error) {
//     console.error(`❌ Failed to delete "${fileKey}" from R2:`, error);
//     throw error;
//   }
// };
import * as fsp from "fs/promises";
import fs, { existsSync } from "fs";
import { spawn } from "child_process";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import s3 from './s3.js';
import dotenv from 'dotenv';
import path from 'path';
import mime from 'mime-types';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

dotenv.config();

// ✅ Helper: build public URL from uploads folder
function getPublicUploadUrl(filename) {
  return `${process.env.SERVER_URL || "http://localhost:5000"}/uploads/${filename}`;
}

// ✅ Helper: safely delete a file
async function safeUnlink(filePath) {
  try {
    await fsp.unlink(filePath);
    console.log(`🗑️ Deleted temp file: ${filePath}`);
  } catch (err) {
    console.warn(`⚠️ Could not delete temp file ${filePath}: ${err.message}`);
  }
}

// ✅ Helper: Validate environment variables
function validateEnv() {
  const requiredEnvVars = ['BUCKET_NAME', 'AWS_REGION'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

/**
 * Uploads a file to AWS S3 with content type and auto folder based on media type
 * @param {string} filePath - Local path of the file to upload
 * @param {string} mimetype - MIME type of the file (optional)
 * @returns {string} - Public URL of the uploaded S3 object
 */
export const uploadFileToS3 = async (filePath, mimetype = null) => {
  validateEnv();
  
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
    const fileContent = await fsp.readFile(filePath);

    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: fileKey,
      Body: fileContent,
      ContentType: contentType,
    });

    await s3.send(command);

    // Try deleting the local file
    await safeUnlink(filePath);

    // Construct public S3 URL
    const s3Url = `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    return s3Url;

  } catch (err) {
    console.error('❌ Upload to S3 failed:', err.message);
    throw new Error('Failed to upload file to S3');
  }
};

function runFFmpeg(args) {
  return new Promise((resolve, reject) => {
    const ffmpegBin = process.env.FFMPEG_PATH || "ffmpeg";
    const p = spawn(ffmpegBin, args, { windowsHide: true });

    let stderr = "";
    p.stderr.on("data", d => {
      stderr += d.toString();
      console.log("FFmpeg:", d.toString());
    });

    p.on("error", reject);
    p.on("close", code => code === 0 ? resolve() : reject(new Error(`FFmpeg exited with code ${code}\n${stderr}`)));
  });
}

// helper: recursive uploader (keeps folders)
async function uploadDirToR2(localDir, r2Prefix) {
  const entries = await fsp.readdir(localDir, { withFileTypes: true });
  
  for (const entry of entries) {
    const full = path.join(localDir, entry.name);
    const key = `${r2Prefix}/${entry.name}`;
    
    if (entry.isDirectory()) {
      await uploadDirToR2(full, key);
    } else {
      const buf = await fsp.readFile(full);
      const type = entry.name.endsWith(".m3u8")
        ? "application/vnd.apple.mpegurl"
        : "video/mp2t";
      
      await s3.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: buf,
        ContentType: type,
      }));
      console.log("📤 Uploaded:", key);
    }
  }
}

export const uploadFileToR2 = async (filePath, mimetype, options = {}) => {
  const { convertToHLS = false, videoId = null } = options;

  // ✅ Enhanced file existence check with better error message
  if (!existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    console.error(`❌ Current working directory: ${process.cwd()}`);
    throw new Error(`File not found: ${filePath}. Please ensure the file was uploaded correctly.`);
  }

  const absInput = path.resolve(filePath);
  const ext = path.extname(absInput).toLowerCase();
  const baseName = path.basename(absInput, ext);
  const contentType = mimetype || mime.lookup(ext) || "application/octet-stream";

  console.log(`📁 Processing file: ${absInput}`);
  console.log(`📊 Content type: ${contentType}`);

  // 🎥 Video → HLS
  if (contentType.startsWith("video/") && convertToHLS) {
    try { 
      await runFFmpeg(["-version"]); 
    } catch { 
      throw new Error("FFmpeg not installed or not in PATH."); 
    }

    const id = videoId || Date.now().toString(); 
    const hlsDir = path.resolve("uploads", "hls", id);

    // Remove old folder if exists
    if (existsSync(hlsDir)) {
      await fsp.rm(hlsDir, { recursive: true, force: true });
    }
    await fsp.mkdir(hlsDir, { recursive: true });

    const args = [
      "-y",
      "-i", absInput,
      "-preset", "veryfast",
      "-c:v", "libx264",
      "-c:a", "aac",
      "-f", "hls",
      "-hls_time", "6",
      "-hls_playlist_type", "vod",
      "-hls_segment_filename", path.join(hlsDir, "seg_%03d.ts"),
      path.join(hlsDir, "prog_index.m3u8"),
    ];

    await runFFmpeg(args);
    
    // ✅ Only delete the source file after successful HLS conversion
    await safeUnlink(absInput);

    // Upload HLS files to R2 if R2_BUCKET_NAME is configured
    if (process.env.R2_BUCKET_NAME) {
      await uploadDirToR2(hlsDir, `hls/${id}`);
      // Clean up local HLS files after upload
      await fsp.rm(hlsDir, { recursive: true, force: true });
      
      const publicUrl = `${process.env.R2_PUBLIC_URL || process.env.SERVER_URL}/hls/${id}/prog_index.m3u8`;
      console.log("✅ HLS ready at:", publicUrl);
      return publicUrl;
    } else {
      // Fallback to local serving
      const publicUrl = `${process.env.SERVER_URL || "http://localhost:5000"}/uploads/hls/${id}/prog_index.m3u8`;
      console.log("✅ HLS ready at:", publicUrl);
      return publicUrl;
    }
  }

  // 📂 Direct upload to R2 or local fallback
  if (process.env.R2_BUCKET_NAME) {
    // Upload directly to R2
    const fileKey = `uploads/${Date.now()}-${baseName}${ext}`;
    const fileContent = await fsp.readFile(absInput);
    
    await s3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      Body: fileContent,
      ContentType: contentType,
    }));
    
    // ✅ Only delete after successful upload
    await safeUnlink(absInput);
    
    const publicUrl = `${process.env.R2_PUBLIC_URL || process.env.SERVER_URL}/${fileKey}`;
    console.log("✅ Uploaded to R2:", publicUrl);
    return publicUrl;
  } else {
    // Local fallback - check if file is already in uploads directory
    const uploadsDir = path.resolve("uploads");
    await fsp.mkdir(uploadsDir, { recursive: true });

    // ✅ If file is already in uploads directory, don't move it
    if (absInput.startsWith(uploadsDir)) {
      console.log("✅ File already in uploads directory");
      const fileName = path.basename(absInput);
      const publicUrl = getPublicUploadUrl(fileName);
      console.log("✅ Serving from uploads:", publicUrl);
      return publicUrl;
    }

    // ✅ Move file to uploads directory
    const newFileName = `${Date.now()}-${baseName}${ext}`;
    const destPath = path.join(uploadsDir, newFileName);

    await fsp.rename(absInput, destPath);

    const publicUrl = getPublicUploadUrl(newFileName);
    console.log("✅ Uploaded locally:", publicUrl);
    return publicUrl;
  }
};

// ✅ Helper to validate and ensure file exists before processing
export const ensureFileExists = async (filePath) => {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  // Check if file is accessible
  try {
    await fsp.access(filePath, fsp.constants.R_OK);
    return true;
  } catch (error) {
    throw new Error(`File not accessible: ${filePath} - ${error.message}`);
  }
};

// ✅ Helper to get file info for debugging
export const getFileInfo = (filePath) => {
  if (!existsSync(filePath)) {
    return { exists: false, path: filePath };
  }
  
  const stats = fs.statSync(filePath);
  return {
    exists: true,
    path: filePath,
    size: stats.size,
    modified: stats.mtime,
    isFile: stats.isFile(),
    isDirectory: stats.isDirectory()
  };
};

export const generateSignedUrl = async (fileKey, expiresIn = 3600) => {
  if (!process.env.R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME environment variable is not configured");
  }

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

export const deleteFileFromR2 = async (filePathOrUrl) => {
  if (!process.env.R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME environment variable is not configured");
  }

  if (!filePathOrUrl) throw new Error("File path or key is required");

  let fileKey;
  
  if (filePathOrUrl.startsWith("http")) {
    // Extract key from URL
    const url = new URL(filePathOrUrl);
    fileKey = url.pathname.substring(1); // Remove leading slash
  } else {
    fileKey = filePathOrUrl;
  }

  try {
    await s3.send(new DeleteObjectCommand({ 
      Bucket: process.env.R2_BUCKET_NAME, 
      Key: fileKey 
    }));
    console.log(`✅ Deleted from R2: ${fileKey}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to delete "${fileKey}" from R2:`, error);
    throw error;
  }
};