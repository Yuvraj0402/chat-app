const router = require('express').Router();
const multer = require('multer');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

// Store in memory for GridFS (multer.memoryStorage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Allow images, audio, video, and common documents
    const allowed = /^(image|audio|video)\/|application\/pdf|text\//;
    if (allowed.test(file.mimetype) || file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(null, true); // Allow all for now; tighten as needed
    }
  },
});

// POST /api/upload - upload file to GridFS, return fileId and url
router.post('/', upload.single('file'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const filename = req.file.originalname || `file-${Date.now()}`;
    const writable = bucket.openUploadStream(filename, {
      contentType: req.file.mimetype,
      metadata: {
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });

    writable.write(req.file.buffer);
    writable.end();

    await new Promise((resolve, reject) => {
      writable.on('finish', resolve);
      writable.on('error', reject);
    });

    const fileId = writable.id.toString();
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/api/files/${fileId}`;

    return res.json({
      fileId,
      url: `/api/files/${fileId}`,
      name: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
