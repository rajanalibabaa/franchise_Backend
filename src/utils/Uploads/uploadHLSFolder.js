// utils/uploadHLSFolder.js
import fs from "fs";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../../utils/Uploads/s3.js";

export async function uploadHLSFolder(localDir, r2Prefix) {
  async function walkAndUpload(dir, prefix) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const key = `${prefix}/${entry.name}`;

      if (entry.isDirectory()) {
        await walkAndUpload(fullPath, key);
      } else {
        const body = fs.createReadStream(fullPath);
        let ContentType = "application/octet-stream";
        if (entry.name.endsWith(".m3u8"))
          ContentType = "application/vnd.apple.mpegurl";
        else if (entry.name.endsWith(".m4s") || entry.name.endsWith(".mp4"))
          ContentType = "video/mp4";

        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            Body: body,
            ContentType,
            CacheControl: entry.name.endsWith(".m3u8")
              ? "public, max-age=60"
              : "public, max-age=31536000, immutable",
          })
        );
        console.log(`✅ Uploaded ${key}`);
      }
    }
  }

  await walkAndUpload(localDir, r2Prefix);
  return `${process.env.R2_PUBLIC_URL}/${r2Prefix}/master.m3u8`;
}
