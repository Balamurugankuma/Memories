const Message = require('../models/Message');

// ─── Post Message ─────────────────────────────────────────────────────────────
exports.postMessage = async (req, res) => {
  try {
    const { name, message } = req.body;
    const newMessage = new Message({ name, message });
    await newMessage.save();
    res.status(201).json({ success: true, message: newMessage });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not save message.' });
  }
};

// ─── Get All Messages ─────────────────────────────────────────────────────────
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch messages.' });
  }
};
