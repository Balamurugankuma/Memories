const express = require('express');
const router  = express.Router();
const { postMessage, getMessages } = require('../controllers/messageController');

router.post('/post-message',  postMessage);
router.get('/messages',       getMessages);

module.exports = router;
