const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  name:       { type: String, required: true },
  photoUrl:   { type: String, required: true },
  publicId:   { type: String },          // Cloudinary public_id for deletion
  title:      { type: String, required: true },
  story:      { type: String, required: true },
  likesCount: { type: Number, default: 0 },
  createdAt:  { type: Date,   default: Date.now }
});

module.exports = mongoose.model('Memory', memorySchema);
