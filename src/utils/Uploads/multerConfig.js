// utils/Uploads/multerConfig.js
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Ensure 'uploads/' directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// ✅ Allowed MIME types: images, videos, PDFs, Word docs
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/quicktime',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
];

// Updated file filter
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Only images, videos, and documents (PDF, DOC, DOCX) are allowed!'),
      false
    );
  }
};

// Export configured multer instance
const upload = multer({ storage, fileFilter });
export default upload;  