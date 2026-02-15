const router = require('express').Router();
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

// GET /api/files/:id - stream file from GridFS
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }
    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const _id = new mongoose.Types.ObjectId(id);
    const cursor = bucket.find({ _id });
    const file = await cursor.next();
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    if (file.metadata?.originalName) {
      res.set('Content-Disposition', `inline; filename="${encodeURIComponent(file.metadata.originalName)}"`);
    }
    const downloadStream = bucket.openDownloadStream(_id);
    downloadStream.pipe(res);
    downloadStream.on('error', (err) => next(err));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
