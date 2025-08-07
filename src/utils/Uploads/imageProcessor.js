import sharp from 'sharp';
import path from 'path';

// Function to generate SVG for text watermark
const generateTextSVG = (text) => {
  return Buffer.from(`
    <svg width="500" height="100">
      <text x="50%" y="50%" font-size="40" fill="rgba(255,255,255,0.5)" font-family="Arial" dominant-baseline="middle" text-anchor="middle">
        ${text}
      </text>
    </svg>
  `);
};

export const addTextWatermarkToImage = async (inputPath, watermarkText) => {
  const outputPath = inputPath.replace(/\.(jpg|jpeg|png|webp|gif)$/, '-watermarked.webp');

  await sharp(inputPath)
    .composite([
      {
        input: generateTextSVG(watermarkText),
        gravity: 'southeast' // bottom-right
      }
    ])
    .webp({ quality: 80 })
    .toFile(outputPath);

  return outputPath;
};
