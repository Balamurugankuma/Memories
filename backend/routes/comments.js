const express = require('express');
const router  = express.Router();
const { addComment, getComments } = require('../controllers/commentController');

router.post('/add-comment',         addComment);
router.get('/comments/:memoryId',   getComments);

module.exports = router;
