const Memory = require('../models/Memory');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ─── Upload Memory ────────────────────────────────────────────────────────────
exports.uploadMemory = async (req, res) => {
  try {
    const { name, title, story } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Photo is required.' });
    }

    // Upload buffer to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'farewell_memories', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
        (error, result) => { error ? reject(error) : resolve(result); }
      );
      stream.end(req.file.buffer);
    });

    const memory = new Memory({
      name,
      title,
      story,
      photoUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id
    });

    await memory.save();
    res.status(201).json({ success: true, memory });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'Upload failed.', error: err.message });
  }
};

// ─── Get All Memories ─────────────────────────────────────────────────────────
exports.getMemories = async (req, res) => {
  try {
    const memories = await Memory.find().sort({ createdAt: -1 });
    res.json({ success: true, memories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch memories.' });
  }
};

// ─── Like Memory ──────────────────────────────────────────────────────────────
exports.likeMemory = async (req, res) => {
  try {
    const { memoryId } = req.body;
    const memory = await Memory.findByIdAndUpdate(
      memoryId,
      { $inc: { likesCount: 1 } },
      { new: true }
    );
    if (!memory) return res.status(404).json({ success: false, message: 'Memory not found.' });
    res.json({ success: true, likesCount: memory.likesCount });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Like failed.' });
  }
};
