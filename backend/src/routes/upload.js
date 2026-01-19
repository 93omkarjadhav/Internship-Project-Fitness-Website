import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import { storage } from '../config/cloudinary.js';

const router = express.Router();

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

let upload;
try {
  upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
  });
} catch (error) {
  console.error('Error configuring Cloudinary storage:', error);
}

const handleUpload = (req, res, next) => {
  if (!isCloudinaryConfigured() || !upload) {
    return res.status(500).json({
      message:
        'Image upload service is not configured. Please add Cloudinary credentials.',
    });
  }

  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res
            .status(400)
            .json({ message: 'File too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }

      return res.status(500).json({
        message: err.message || 'Upload failed. Please try again.',
      });
    }

    next();
  });
};

router.post(
  '/upload-image',
  authenticateToken,
  handleUpload,
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    res.json({
      message: 'Image uploaded successfully',
      url: req.file.path,
    });
  }
);

router.get('/upload-status', authenticateToken, (_req, res) => {
  const configured = isCloudinaryConfigured();
  res.json({
    configured,
    message: configured
      ? 'Image upload service is ready'
      : 'Image upload service is not configured.',
  });
});

export default router;

