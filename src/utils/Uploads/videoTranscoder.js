// utils/videoTranscoder.js
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";

export async function transcodeToHLS(inputFile, outputDir) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const masterPlaylist = path.join(outputDir, "master.m3u8");

    ffmpeg(inputFile)
      .addOption([
        "-filter_complex",
        "[0:v]split=3[v1][v2][v3]; \
         [v1]scale=w=426:h=240:force_original_aspect_ratio=decrease[v1out]; \
         [v2]scale=w=640:h=360:force_original_aspect_ratio=decrease[v2out]; \
         [v3]scale=w=1280:h=720:force_original_aspect_ratio=decrease[v3out]"
      ])
      .addOption([
        "-map", "[v1out]", "-c:v:0", "h264", "-b:v:0", "400k",
        "-map", "0:a:0", "-c:a:0", "aac", "-b:a:0", "64k",

        "-map", "[v2out]", "-c:v:1", "h264", "-b:v:1", "800k",
        "-map", "0:a:0", "-c:a:1", "aac", "-b:a:1", "96k",

        "-map", "[v3out]", "-c:v:2", "h264", "-b:v:2", "2800k",
        "-map", "0:a:0", "-c:a:2", "aac", "-b:a:2", "128k",

        "-f", "hls",
        "-hls_time", "4",
        "-hls_playlist_type", "vod",
        "-hls_segment_type", "fmp4",
        "-master_pl_name", "master.m3u8",
        "-hls_segment_filename", path.join(outputDir, "v%v/seg_%03d.m4s"),
        "-var_stream_map", "v:0,a:0 v:1,a:1 v:2,a:2"
      ])
      .output(path.join(outputDir, "v%v/index.m3u8"))
      .on("end", () => {
        console.log("✅ HLS Transcoding complete");
        resolve(masterPlaylist);
      })
      .on("error", (err) => {
        console.error("❌ FFmpeg error:", err);
        reject(err);
      })
      .run();
  });
}
