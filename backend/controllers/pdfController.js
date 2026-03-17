const Memory = require('../models/Memory');
const PDFDocument = require('pdfkit');
const axios = require('axios');

exports.downloadMemoryBook = async (req, res) => {
  try {
    const memories = await Memory.find().sort({ createdAt: 1 });

    const doc = new PDFDocument({ size: 'A4', margin: 50, autoFirstPage: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="FarewellMemoryBook2026.pdf"');
    doc.pipe(res);

    // ── Cover Page ─────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1a0a2e');

    doc.fillColor('#f5c518')
       .fontSize(36)
       .font('Helvetica-Bold')
       .text('Our College Memories', 50, 180, { align: 'center' });

    doc.fillColor('#ffffff')
       .fontSize(22)
       .font('Helvetica')
       .text('Farewell 2026', 50, 240, { align: 'center' });

    doc.fillColor('#c0a0ff')
       .fontSize(14)
       .text('A journey we will never forget.', 50, 280, { align: 'center' });

    doc.fillColor('#888888')
       .fontSize(12)
       .text(`${memories.length} Memories Compiled`, 50, 330, { align: 'center' });

    // ── Memory Pages ───────────────────────────────────────────────────────
    for (let i = 0; i < memories.length; i++) {
      const mem = memories[i];
      doc.addPage();

      // Background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0f0f1a');

      // Memory number badge
      doc.roundedRect(50, 30, 40, 40, 8).fill('#f5c518');
      doc.fillColor('#1a0a2e').fontSize(16).font('Helvetica-Bold')
         .text(`${i + 1}`, 50, 44, { width: 40, align: 'center' });

      // Title
      doc.fillColor('#f5c518').fontSize(22).font('Helvetica-Bold')
         .text(mem.title || 'Untitled Memory', 105, 35, { width: 400 });

      // Student name
      doc.fillColor('#c0a0ff').fontSize(13).font('Helvetica')
         .text(`By ${mem.name}`, 105, 62);

      // Date
      const date = new Date(mem.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      doc.fillColor('#666688').fontSize(10).text(date, 105, 80);

      // Try to embed image
      let imgY = 110;
      try {
        const imgResp = await axios.get(mem.photoUrl, { responseType: 'arraybuffer', timeout: 8000 });
        const imgBuffer = Buffer.from(imgResp.data);
        doc.image(imgBuffer, 50, imgY, { fit: [495, 260], align: 'center' });
        imgY += 275;
      } catch (_) {
        doc.roundedRect(50, imgY, 495, 100, 10).fill('#2a1a4e');
        doc.fillColor('#888888').fontSize(11).text('[Image could not be loaded]', 50, imgY + 42, { width: 495, align: 'center' });
        imgY += 115;
      }

      // Divider
      doc.moveTo(50, imgY + 5).lineTo(545, imgY + 5).strokeColor('#3a2a6e').lineWidth(1).stroke();
      imgY += 18;

      // Story
      doc.fillColor('#ddddee').fontSize(12).font('Helvetica')
         .text(mem.story || '', 50, imgY, { width: 495, lineGap: 4 });

      // Likes
      const likeY = doc.page.height - 60;
      doc.fillColor('#f5c518').fontSize(12).text(`❤  ${mem.likesCount || 0} likes`, 50, likeY);
    }

    // ── Back Page ──────────────────────────────────────────────────────────
    doc.addPage();
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1a0a2e');
    doc.fillColor('#f5c518').fontSize(28).font('Helvetica-Bold')
       .text('Farewell, Class of 2026', 50, 280, { align: 'center' });
    doc.fillColor('#c0a0ff').fontSize(16).font('Helvetica')
       .text('May your memories stay forever golden.', 50, 330, { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('PDF error:', err);
    res.status(500).json({ success: false, message: 'PDF generation failed.', error: err.message });
  }
};
