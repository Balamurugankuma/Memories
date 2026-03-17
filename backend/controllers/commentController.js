const Comment = require('../models/Comment');

// ─── Add Comment ──────────────────────────────────────────────────────────────
exports.addComment = async (req, res) => {
  try {
    const { memoryId, username, comment } = req.body;
    const newComment = new Comment({ memoryId, username, comment });
    await newComment.save();
    res.status(201).json({ success: true, comment: newComment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not save comment.' });
  }
};

// ─── Get Comments for a Memory ────────────────────────────────────────────────
exports.getComments = async (req, res) => {
  try {
    const { memoryId } = req.params;
    const comments = await Comment.find({ memoryId }).sort({ createdAt: -1 });
    res.json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch comments.' });
  }
};
