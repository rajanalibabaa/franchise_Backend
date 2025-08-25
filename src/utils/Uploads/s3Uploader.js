
import * as fsp from "fs/promises";
import fs from "fs"; // for sync methods
import { exec,spawn } from "child_process";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import s3 from './s3.js';
import dotenv from 'dotenv';
import path from 'path';
import mime from 'mime-types';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { console } from 'inspector';
import util from "util";
dotenv.config();
const execAsync = util.promisify(exec);

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



// helper: run ffmpeg with args (Windows-safe)
function runFFmpeg(args) {
  return new Promise((resolve, reject) => {
    const ffmpegBin = process.env.FFMPEG_PATH || "ffmpeg";
    const p = spawn(ffmpegBin, args, { windowsHide: true });

    let stderr = "";
    p.stderr.on("data", d => { 
      stderr += d.toString(); 
      console.log("FFmpeg:", d.toString());
    });

    p.stdout.on("data", d => console.log("FFmpeg out:", d.toString()));

    p.on("error", reject);
    p.on("close", code => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}\n${stderr}`));
    });
  });
}


// helper: recursive uploader (keeps folders)
async function uploadDirToR2(localDir, r2Prefix) {
  const entries = fs.readdirSync(localDir, { withFileTypes: true });
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
  const { convertToHLS = false } = options;

  if (!filePath) throw new Error("File path is required");
  if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);

  const absInput = path.resolve(filePath);
  const ext = path.extname(absInput).toLowerCase();
  const baseName = path.basename(absInput, ext);
  const contentType = mimetype || "video/mp4"; // fallback

  if (contentType.startsWith("video/") && convertToHLS) {
    try { await runFFmpeg(["-version"]); } 
    catch { throw new Error("FFmpeg not found or not in PATH."); }

    const videoId = Date.now().toString();
    const hlsDir = path.resolve("uploads", "hls", videoId);
    await fsp.mkdir(hlsDir, { recursive: true });

    console.log("🚀 Converting to HLS:", absInput, "→", hlsDir);

    // Simple 2-resolution HLS
    const args = [
      "-y",
      "-i",
      absInput,
      "-preset",
      "veryfast",
      "-c:v",
      "libx264",
      "-c:a",
      "aac",
      "-f",
      "hls",
      "-hls_time",
      "6",
      "-hls_playlist_type",
      "vod",
      "-hls_segment_filename",
      path.join(hlsDir, "seg_%03d.ts"),
      path.join(hlsDir, "prog_index.m3u8"),
    ];

    await runFFmpeg(args);

    // Verify output
    // const playlistPath = path.join(hlsDir, "prog_index.m3u8");
    // if (!fs.existsSync(playlistPath)) throw new Error("HLS conversion failed: playlist not found");
 const publicUrl = `${process.env.SERVER_URL || "http://localhost:5000"}/uploads/hls/${videoId}/prog_index.m3u8`;
    console.log("✅ HLS conversion finished:", publicUrl);

 // ✅ delete original file after conversion
    await safeUnlink(absInput);

    // TODO: uploadDirToR2(hlsDir, `videos/${videoId}`);
    // Cleanup local files if needed
    return publicUrl;
  }

// / 📂 Direct upload fallback (fix here ✅)
  const uploadsDir = path.resolve("uploads");
  await fsp.mkdir(uploadsDir, { recursive: true });

  const newFileName = `${Date.now()}-${baseName}${ext}`;
  const destPath = path.join(uploadsDir, newFileName);

  if (absInput !== destPath) {
    await fsp.copyFile(absInput, destPath);
  }

    // ✅ delete original file after copying
  await safeUnlink(absInput);
  

  // ✅ Return proper URL instead of absInput
  return getPublicUploadUrl(newFileName);
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

export const deleteFileFromR2 = async (filePathOrUrl) => {
  if (!filePathOrUrl) {
    throw new Error("File path or key is required for deletion");
  }

 
  const baseUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "") || "";
  console.log(`Base URL for R2: ${baseUrl}`);
  const fileKey = filePathOrUrl.startsWith("http")
    ? filePathOrUrl.replace(baseUrl + "/", "")
    : filePathOrUrl;
  console.log(`File key to delete: ${fileKey}`);

  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
    });

    await s3.send(command);
    console.log(`✅ Deleted from R2: ${fileKey}`);
    return { success: true, message: `File "${fileKey}" deleted successfully.` };
  } catch (error) {
    console.error(`❌ Failed to delete "${fileKey}" from R2:`, error);
    throw new Error(`Failed to delete "${fileKey}" from R2: ${error.message}`);
  }
};
