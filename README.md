# 🎓 Our College Memories — Farewell 2026
### A Full-Stack Memory Sharing Website

---

## 📁 Project Structure

```
farewell-project/
├── frontend/
│   ├── index.html          ← All UI sections
│   ├── style.css           ← Complete styling
│   ├── script.js           ← All frontend logic
│   ├── music/
│   │   └── farewell.mp3    ← Background music (add your own)
│   └── images/             ← Optional local images
│
└── backend/
    ├── server.js           ← Express app entry point
    ├── .env                ← Environment variables (configure this!)
    ├── package.json
    ├── models/
    │   ├── Memory.js       ← MongoDB Memory schema
    │   ├── Comment.js      ← MongoDB Comment schema
    │   └── Message.js      ← MongoDB Message schema
    ├── controllers/
    │   ├── memoryController.js
    │   ├── commentController.js
    │   ├── messageController.js
    │   └── pdfController.js
    └── routes/
        ├── memories.js
        ├── comments.js
        ├── messages.js
        └── pdf.js
```

---

## ⚙️ Setup & Run in VS Code

### Step 1 — Prerequisites
Make sure you have installed:
- Node.js v18+ → https://nodejs.org
- MongoDB Community Server → https://www.mongodb.com/try/download/community
- A Cloudinary account (free) → https://cloudinary.com

### Step 2 — Open in VS Code
```bash
# Open VS Code in the project folder
code farewell-project
```

### Step 3 — Configure Environment Variables
Edit `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/farewelldb
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
```
> Get Cloudinary credentials from: Dashboard → API Keys on cloudinary.com

### Step 4 — Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 5 — Start MongoDB
```bash
# On Windows (if installed as service, it may already be running)
# On Mac/Linux:
mongod --dbpath /usr/local/var/mongodb
```

### Step 6 — Start the Backend Server
```bash
# In the backend/ folder:
npm run dev         # Uses nodemon for auto-restart
# OR
npm start           # Plain node
```
You'll see:
```
✅ MongoDB Connected
🚀 Server running on http://localhost:5000
```

### Step 7 — Open the Website
Open your browser at: **http://localhost:5000**

---

## 🔌 API Endpoints

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | /api/upload-memory              | Upload photo + memory    |
| GET    | /api/memories                   | Get all memories         |
| POST   | /api/like-memory                | Like a memory            |
| POST   | /api/add-comment                | Add a comment            |
| GET    | /api/comments/:memoryId         | Get comments             |
| POST   | /api/post-message               | Post farewell message    |
| GET    | /api/messages                   | Get all messages         |
| GET    | /api/download-memory-book       | Download PDF             |

---

## 📖 Feature Explanations

---

### 1. How Photo Upload Works

**Frontend → Backend → Cloudinary → MongoDB**

1. The student fills out the form and selects a photo.
2. On submit, JavaScript creates a `FormData` object containing the file and text fields.
3. A `POST /api/upload-memory` request is sent to the Express backend.
4. `multer` middleware (configured with `memoryStorage`) receives the file as an in-memory **Buffer** — no file is saved to disk.
5. The Buffer is piped to Cloudinary via an upload stream.
6. Cloudinary returns a `secure_url` and `public_id`.
7. A new MongoDB `Memory` document is created with the URL and all text data.
8. The frontend receives `{ success: true, memory }` and refreshes the gallery.

**Key code** — `memoryController.js`:
```js
const stream = cloudinary.uploader.upload_stream(
  { folder: 'farewell_memories' },
  (error, result) => { error ? reject(error) : resolve(result); }
);
stream.end(req.file.buffer);
```

---

### 2. How Cloudinary Stores Images

Cloudinary is a cloud-based image CDN. Here's what happens:

- The image is uploaded to Cloudinary's servers under the folder `farewell_memories`.
- Cloudinary automatically optimizes the image (compression, format conversion with `fetch_format: auto`).
- A permanent CDN URL is returned, e.g.:  
  `https://res.cloudinary.com/your_cloud/image/upload/v123/farewell_memories/abc123.jpg`
- This URL is stored in MongoDB and served directly to the frontend — no local storage needed.
- Cloudinary's free tier supports 25 GB storage and 25 GB monthly bandwidth.

---

### 3. How MongoDB Stores Memory Data

MongoDB stores data as **JSON-like documents** in collections.

**`memories` collection** — each document looks like:
```json
{
  "_id": "ObjectId(64f...)",
  "name": "Aanya Sharma",
  "photoUrl": "https://res.cloudinary.com/.../image.jpg",
  "publicId": "farewell_memories/abc123",
  "title": "Our Last Canteen Lunch",
  "story": "We stayed until the canteen closed...",
  "likesCount": 12,
  "createdAt": "2026-03-15T10:23:00Z"
}
```

**`comments` collection**:
```json
{
  "memoryId": "ObjectId(64f...)",   ← References the memory
  "username": "Rohan",
  "comment": "This made me cry!",
  "createdAt": "2026-03-15T11:00:00Z"
}
```

**`messages` collection** (farewell board):
```json
{
  "name": "Priya",
  "message": "Best 4 years of my life. Miss you all!",
  "createdAt": "2026-03-15T09:00:00Z"
}
```

Mongoose models define the schema and validate data before saving.

---

### 4. How Like & Comment System Works

**Likes:**
- Each memory card has a ❤️ button storing the memory's `_id`.
- On click, a `POST /api/like-memory` request sends `{ memoryId }`.
- MongoDB's `$inc` operator atomically increments `likesCount` by 1.
- The button is disabled after clicking (tracked with a CSS class) to prevent double-likes.
- The updated count is returned and shown in the UI.

**Comments:**
- Clicking 💬 toggles the comment section open and triggers `GET /api/comments/:memoryId`.
- Comments are loaded and displayed in reverse-chronological order.
- New comments are submitted via `POST /api/add-comment` with `{ memoryId, username, comment }`.
- After posting, comments are re-fetched to show the latest.

---

### 5. How 3D Gallery Animation Works

The 3D carousel uses **CSS `transform-style: preserve-3d`** and `perspective`.

**Setup:**
- A `carousel-stage` div is set to `transform-style: preserve-3d`.
- Each card is positioned using:
  ```css
  transform: rotateY(Xdeg) translateZ(Rpx);
  ```
  where `X` = `(360 / count) × index` (evenly spaced around a circle)
  and `R` = calculated radius based on card count.

**Rotation:**
- The entire stage is rotated with `rotateY(angle)` — this spins all cards together.
- Each click adds/subtracts 36° to the stage's `rotateY`.
- CSS `transition: transform 0.8s cubic-bezier(0.22,1,0.36,1)` creates smooth easing.

**Auto-rotate:**
- A `setInterval` every 2.8 seconds calls `rotateRight()`.
- The Pause button toggles a `carouselPaused` flag to stop/resume auto-spin.

---

### 6. How Memory Book PDF Generation Works

**Backend (PDFKit):**
1. `GET /api/download-memory-book` is called.
2. All memories are fetched from MongoDB, sorted by date.
3. PDFKit creates a new A4 document with custom dark luxury styling.
4. **Cover page** — gold title on dark background.
5. **For each memory:**
   - The photo is fetched from Cloudinary using `axios` and embedded directly.
   - A formatted page is rendered with title, name, date, story, and like count.
6. A closing page is added.
7. The PDF is streamed directly to the HTTP response with the header:
   `Content-Disposition: attachment; filename="FarewellMemoryBook2026.pdf"`

**Frontend:**
- The response is received as a Blob.
- A temporary `<a>` tag with `download` attribute triggers the browser download.
- No server-side file is saved — the PDF is generated and streamed in-memory.

---

### 7. Background Music Setup

1. Add your MP3 file to `frontend/music/farewell.mp3`
2. The `<audio>` tag has `loop` so it plays continuously.
3. Music only plays after user interaction (browser autoplay policy).
4. The ♪ button in the bottom-right corner toggles play/pause.

**Recommended free music sources:**
- https://pixabay.com/music/ (search "emotional piano")
- https://freemusicarchive.org

---

## 🎨 Frontend Sections

| Section         | Description                                          |
|-----------------|------------------------------------------------------|
| Hero            | Full-screen animated title with floating particles   |
| Upload Form     | Drag-and-drop photo upload with live preview         |
| Gallery Grid    | Responsive card grid with hover effects & lightbox  |
| 3D Carousel     | CSS 3D rotating gallery of uploaded photos           |
| Farewell Event  | Event details + live countdown timer                 |
| Timeline        | 4-year journey with scroll-triggered animations      |
| Message Board   | Post and view farewell messages in masonry layout    |

---

## 🛠️ Tech Stack Summary

| Layer          | Technology                |
|----------------|---------------------------|
| Frontend       | HTML5, CSS3, Vanilla JS   |
| Backend        | Node.js + Express.js      |
| Database       | MongoDB + Mongoose        |
| Image Storage  | Cloudinary                |
| File Upload    | Multer (memory storage)   |
| PDF Generation | PDFKit + Axios            |

---

## 📌 Notes

- Add `farewell.mp3` manually to `frontend/music/` — it's not included.
- The `.env` file is not committed to git. Never share your Cloudinary secret key.
- For production deployment, use a service like **Railway**, **Render**, or **Heroku** for the backend, and **MongoDB Atlas** for the database.

---

*Built with love for the Class of 2026 ✦*
