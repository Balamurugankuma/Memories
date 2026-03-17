const express = require('express');
const router  = express.Router();
const { downloadMemoryBook } = require('../controllers/pdfController');

router.get('/download-memory-book', downloadMemoryBook);

module.exports = router;
