const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const ExifParser = require('../utils/exifParser');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'uploads');

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = (process.env.ALLOWED_EXTENSIONS || 'jpg,jpeg,png,heic,webp,tiff,pdf').split(',');
    const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
    
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`File type .${fileExtension} not allowed. Allowed types: ${allowedExtensions.join(', ')}`), false);
    }
  }
});

// Create uploads directory if it doesn't exist
fs.mkdir(uploadDir, { recursive: true }).catch(() => {});

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select an image file to upload'
      });
    }

    const tempFileName = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${path.extname(req.file.originalname)}`;
    const tempFilePath = path.join(uploadDir, tempFileName);

    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(tempFilePath), { recursive: true });
      
      // Write file and wait for it to complete
      await fs.writeFile(tempFilePath, req.file.buffer);
      
      // Verify file exists before proceeding
      await fs.access(tempFilePath);
      
      const exifParser = new ExifParser();
      const metadata = await exifParser.extractMetadata(tempFilePath);

      await fs.unlink(tempFilePath);

      const response = {
        filename: req.file.originalname,
        filesize: req.file.size,
        mimetype: req.file.mimetype,
        uploadTime: new Date().toISOString(),
        metadata: metadata
      };

      res.json(response);

    } catch (processingError) {
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupError) {
        // Silent cleanup
      }
      
      throw processingError;
    }

  } catch (error) {
    res.status(500).json({
      error: 'Failed to process image',
      message: error.message
    });
  }
});

router.post('/analyze-url', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({
        error: 'No URL provided',
        message: 'Please provide an image URL'
      });
    }

    res.status(501).json({
      error: 'Not implemented',
      message: 'URL analysis feature coming soon'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to analyze image from URL',
      message: error.message
    });
  }
});

router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Upload Service',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
