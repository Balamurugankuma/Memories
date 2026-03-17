/* ═══════════════════════════════════════════════════════
   FAREWELL 2026  —  script.js
═══════════════════════════════════════════════════════ */

const API ='/api';   // Change to 'http://localhost:5000/api' if served separately

/* ══════════════════════════════════
   NAVBAR SCROLL EFFECT
══════════════════════════════════ */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
});

/* ══════════════════════════════════
   HERO PARTICLES
══════════════════════════════════ */
(function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top:  ${Math.random() * 100}%;
      width:  ${Math.random() * 3 + 1}px;
      height: ${Math.random() * 3 + 1}px;
      animation-delay:    ${Math.random() * 8}s;
      animation-duration: ${4 + Math.random() * 6}s;
    `;
    container.appendChild(p);
  }
})();

/* ══════════════════════════════════
   MUSIC PLAYER
══════════════════════════════════ */
let musicPlaying = false;
function toggleMusic() {
  const audio = document.getElementById('bg-music');
  const icon  = document.getElementById('music-icon');
  const label = document.getElementById('music-label');
  if (musicPlaying) {
    audio.pause();
    icon.textContent  = '♪';
    label.textContent = 'Play Music';
    musicPlaying = false;
  } else {
    audio.play().catch(() => {});
    icon.textContent  = '⏸';
    label.textContent = 'Pause';
    musicPlaying = true;
  }
}

/* ══════════════════════════════════
   PHOTO PREVIEW
══════════════════════════════════ */
document.getElementById('photo').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('photo-preview').src = e.target.result;
    document.getElementById('photo-preview-wrap').style.display = 'flex';
    document.querySelector('.drop-zone-content').style.display  = 'none';
  };
  reader.readAsDataURL(file);
});

function removePhoto() {
  document.getElementById('photo').value = '';
  document.getElementById('photo-preview-wrap').style.display = 'none';
  document.querySelector('.drop-zone-content').style.display  = 'flex';
}

// Drag-over styling
const dropZone = document.getElementById('drop-zone');
['dragenter','dragover'].forEach(e => dropZone.addEventListener(e, () => dropZone.classList.add('drag-over')));
['dragleave','drop'].forEach(e => dropZone.addEventListener(e, () => dropZone.classList.remove('drag-over')));

/* ══════════════════════════════════
   UPLOAD MEMORY FORM
══════════════════════════════════ */
document.getElementById('upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn     = document.getElementById('submit-btn');
  const text    = document.getElementById('submit-text');
  const loader  = document.getElementById('submit-loader');
  const msgBox  = document.getElementById('upload-msg');

  text.style.display   = 'none';
  loader.style.display = 'block';
  btn.disabled = true;
  msgBox.className = 'upload-msg';
  msgBox.textContent = '';

  try {
    const formData = new FormData(document.getElementById('upload-form'));
    const res  = await fetch(`${API}/upload-memory`, { method: 'POST', body: formData });
    const data = await res.json();

    if (data.success) {
      msgBox.textContent = '✅ Memory uploaded successfully!';
      msgBox.className   = 'upload-msg success';
      document.getElementById('upload-form').reset();
      removePhoto();
      fetchAndRenderGallery();
      fetchCarouselPhotos();
    } else {
      throw new Error(data.message || 'Upload failed.');
    }
  } catch (err) {
    msgBox.textContent = `❌ ${err.message}`;
    msgBox.className   = 'upload-msg error';
  } finally {
    text.style.display   = 'block';
    loader.style.display = 'none';
    btn.disabled = false;
  }
});

/* ══════════════════════════════════
   GALLERY
══════════════════════════════════ */
let allMemories = [];

async function fetchAndRenderGallery() {
  const grid = document.getElementById('gallery-grid');
  try {
    const res  = await fetch(`${API}/memories`);
    const data = await res.json();
    allMemories = data.memories || [];
    renderGallery(allMemories);
  } catch {
    grid.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1;padding:40px;">Could not load memories.</p>';
  }
}

function renderGallery(memories) {
  const grid = document.getElementById('gallery-grid');
  if (!memories.length) {
    grid.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1;padding:80px;font-family:var(--font-serif);font-size:1.1rem;">No memories yet. Be the first to share one! ✦</p>';
    return;
  }
  grid.innerHTML = memories.map(m => createCardHTML(m)).join('');
}

function createCardHTML(m) {
  const date = new Date(m.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  return `
    <div class="memory-card" id="card-${m._id}">
      <div class="card-img-wrap" onclick="openLightbox('${m._id}')">
        <img src="${m.photoUrl}" alt="${escapeHtml(m.title)}" loading="lazy"/>
        <div class="card-img-overlay"></div>
        <span class="zoom-hint">🔍 View</span>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-name">${escapeHtml(m.name)}</span>
          <span class="card-date">${date}</span>
        </div>
        <h3 class="card-title">${escapeHtml(m.title)}</h3>
        <p class="card-story">${escapeHtml(m.story)}</p>
      </div>
      <div class="card-actions">
        <button class="like-btn" onclick="likeMemory('${m._id}', this)" data-id="${m._id}">
          <span class="heart">❤️</span>
          <span class="like-count">${m.likesCount || 0}</span>
        </button>
        <button class="comment-toggle" onclick="toggleComments('${m._id}')">
          💬 Comments
        </button>
      </div>
      <div class="comment-section" id="comments-${m._id}">
        <div class="comment-list" id="comment-list-${m._id}">
          <p class="no-comments">Loading…</p>
        </div>
        <div class="comment-input-row">
          <input type="text" placeholder="Add a comment…" id="comment-input-${m._id}"/>
          <button class="comment-submit-btn" onclick="submitComment('${m._id}')">Post</button>
        </div>
      </div>
    </div>
  `;
}

/* ══════════════════════════════════
   LIKE
══════════════════════════════════ */
async function likeMemory(id, btn) {
  if (btn.classList.contains('liked')) return;
  btn.classList.add('liked');
  try {
    const res  = await fetch(`${API}/like-memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memoryId: id })
    });
    const data = await res.json();
    if (data.success) {
      btn.querySelector('.like-count').textContent = data.likesCount;
    }
  } catch {}
}

/* ══════════════════════════════════
   COMMENTS
══════════════════════════════════ */
async function toggleComments(id) {
  const section = document.getElementById(`comments-${id}`);
  section.classList.toggle('open');
  if (section.classList.contains('open')) {
    loadComments(id);
  }
}

async function loadComments(id) {
  const list = document.getElementById(`comment-list-${id}`);
  try {
    const res  = await fetch(`${API}/comments/${id}`);
    const data = await res.json();
    const comments = data.comments || [];
    if (!comments.length) {
      list.innerHTML = '<p class="no-comments">No comments yet. Be the first!</p>';
      return;
    }
    list.innerHTML = comments.map(c => `
      <div class="comment-item">
        <div class="comment-user">${escapeHtml(c.username)}</div>
        <div class="comment-text">${escapeHtml(c.comment)}</div>
      </div>
    `).join('');
  } catch {
    list.innerHTML = '<p class="no-comments">Could not load comments.</p>';
  }
}

async function submitComment(id) {
  const input = document.getElementById(`comment-input-${id}`);
  const comment = input.value.trim();
  if (!comment) return;
  const username = prompt('Your name:') || 'Anonymous';
  try {
    const res  = await fetch(`${API}/add-comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memoryId: id, username, comment })
    });
    const data = await res.json();
    if (data.success) {
      input.value = '';
      loadComments(id);
    }
  } catch {}
}

/* ══════════════════════════════════
   LIGHTBOX
══════════════════════════════════ */
function openLightbox(id) {
  const m = allMemories.find(x => x._id === id);
  if (!m) return;
  document.getElementById('lightbox-img').src   = m.photoUrl;
  document.getElementById('lightbox-title').textContent = m.title;
  document.getElementById('lightbox-name').textContent  = `By ${m.name}`;
  document.getElementById('lightbox-story').textContent = m.story;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

/* ══════════════════════════════════
   3D CAROUSEL
══════════════════════════════════ */
let carouselAngle   = 0;
let carouselTimer   = null;
let carouselPaused  = false;
let carouselPhotos  = [];

async function fetchCarouselPhotos() {
  try {
    const res  = await fetch(`${API}/memories`);
    const data = await res.json();
    carouselPhotos = (data.memories || []).slice(0, 10);
    buildCarousel();
  } catch {}
}

function buildCarousel() {
  const stage = document.getElementById('carousel-stage');
  if (!carouselPhotos.length) {
    stage.parentElement.innerHTML = '<p class="carousel-empty">Upload memories to see them here!</p>';
    return;
  }
  const count  = carouselPhotos.length;
  const radius = Math.round(220 / Math.tan(Math.PI / count));
  stage.innerHTML = carouselPhotos.map((m, i) => {
    const angle = (360 / count) * i;
    return `
      <div class="carousel-item"
           style="transform: rotateY(${angle}deg) translateZ(${radius}px)"
           onclick="openLightbox('${m._id}')">
        <img src="${m.photoUrl}" alt="${escapeHtml(m.title)}" loading="lazy"/>
        <div class="carousel-item-label">
          <h4>${escapeHtml(m.title)}</h4>
          <p>${escapeHtml(m.name)}</p>
        </div>
      </div>
    `;
  }).join('');
  startAutoRotate();
}

function startAutoRotate() {
  if (carouselTimer) clearInterval(carouselTimer);
  carouselTimer = setInterval(() => {
    if (!carouselPaused) rotateRight();
  }, 2800);
}

function rotateLeft()  { carouselAngle -= 36; applyRotation(); }
function rotateRight() { carouselAngle += 36; applyRotation(); }
function applyRotation() {
  document.getElementById('carousel-stage').style.transform = `rotateY(${carouselAngle}deg)`;
}

function pauseCarousel() {
  carouselPaused = !carouselPaused;
  document.getElementById('pause-btn').textContent = carouselPaused ? '▶ Play' : '⏸ Pause';
}

/* ══════════════════════════════════
   COUNTDOWN
══════════════════════════════════ */
(function countdown() {
  const target = new Date('2026-03-18T10:00:00');
  function tick() {
    const diff = target - new Date();
    if (diff <= 0) {
      document.getElementById('countdown').innerHTML = '<p style="color:var(--gold);font-family:var(--font-display);font-size:1.5rem;">🎉 The Farewell is Today!</p>';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);
    document.getElementById('cd-days').textContent  = String(d).padStart(2,'0');
    document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
    document.getElementById('cd-mins').textContent  = String(m).padStart(2,'0');
    document.getElementById('cd-secs').textContent  = String(s).padStart(2,'0');
  }
  tick();
  setInterval(tick, 1000);
})();

/* ══════════════════════════════════
   TIMELINE SCROLL ANIMATION
══════════════════════════════════ */
(function observeTimeline() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.2 });
  document.querySelectorAll('.timeline-item').forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════
   MESSAGE BOARD
══════════════════════════════════ */
document.getElementById('message-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name    = document.getElementById('msg-name').value.trim();
  const message = document.getElementById('msg-text').value.trim();
  if (!name || !message) return;
  try {
    const res  = await fetch(`${API}/post-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('msg-name').value = '';
      document.getElementById('msg-text').value = '';
      fetchAndRenderMessages();
    }
  } catch {}
});

async function fetchAndRenderMessages() {
  const grid = document.getElementById('messages-grid');
  try {
    const res  = await fetch(`${API}/messages`);
    const data = await res.json();
    const msgs = data.messages || [];
    if (!msgs.length) {
      grid.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px;font-style:italic;">No messages yet. Write the first farewell note!</p>';
      return;
    }
    grid.innerHTML = msgs.map(m => `
      <div class="message-card">
        <div class="msg-author">✦ ${escapeHtml(m.name)}</div>
        <p class="msg-text">${escapeHtml(m.message)}</p>
      </div>
    `).join('');
  } catch {
    grid.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px;">Could not load messages.</p>';
  }
}

/* ══════════════════════════════════
   PDF DOWNLOAD
══════════════════════════════════ */
async function downloadPDF() {
  const btn = event.currentTarget;
  const orig = btn.textContent;
  btn.textContent = '⏳ Generating…';
  btn.disabled = true;
  try {
    const res = await fetch(`${API}/download-memory-book`);
    if (!res.ok) throw new Error('PDF generation failed.');
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'FarewellMemoryBook2026.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('PDF generation failed: ' + err.message);
  } finally {
    btn.textContent = orig;
    btn.disabled = false;
  }
}

/* ══════════════════════════════════
   HELPERS
══════════════════════════════════ */
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* ══════════════════════════════════
   INIT
══════════════════════════════════ */
fetchAndRenderGallery();
fetchCarouselPhotos();
fetchAndRenderMessages();
