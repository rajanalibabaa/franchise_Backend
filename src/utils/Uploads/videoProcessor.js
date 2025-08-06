import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

export const addTextWatermarkToVideo = (inputPath, watermarkText) => {
  return new Promise((resolve, reject) => {
    const outputPath = inputPath.replace(/\.(mp4|mov)$/, '-watermarked.mp4');

    ffmpeg(inputPath)
      .videoFilters({
        filter: 'drawtext',
        options: {
          fontfile: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', // Change if needed
          text: watermarkText,
          fontsize: 24,
          fontcolor: 'white@0.5',
          x: '(w-text_w)-20', // bottom-right corner
          y: '(h-text_h)-20',
          box: 1,
          boxcolor: 'black@0.3',
          boxborderw: 5
        }
      })
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
};
