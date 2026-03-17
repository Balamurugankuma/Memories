const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farewelldb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

// ─── Routes ───────────────────────────────────────────────────────────────────
const memoriesRouter  = require('./routes/memories');
const commentsRouter  = require('./routes/comments');
const messagesRouter  = require('./routes/messages');
const pdfRouter       = require('./routes/pdf');

// Use a single API base path (e.g., '/api') for all backend routes.
// This keeps the frontend endpoints consistent with `frontend/script.js`.
let API_BASE = process.env.API_BASE_PATH;
if (typeof API_BASE !== 'string' || !API_BASE.trim()) {
  API_BASE = '/api';
}


app.use(API_BASE, memoriesRouter);
app.use(API_BASE, commentsRouter);
app.use(API_BASE, messagesRouter);
app.use(API_BASE, pdfRouter);

// ─── Root ─────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
