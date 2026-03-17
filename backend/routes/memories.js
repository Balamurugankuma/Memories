const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { uploadMemory, getMemories, likeMemory } = require('../controllers/memoryController');

// Use memoryStorage so file is available as a Buffer (for Cloudinary streaming)
const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'), false);
    }
    cb(null, true);
  }
});

router.post('/upload-memory', upload.single('photo'), uploadMemory);
router.get('/memories',        getMemories);
router.post('/like-memory',    likeMemory);

module.exports = router;
