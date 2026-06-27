// utils/pdf.js — PDF generation using pdfkit
const PDFDocument = require('pdfkit');

const generateUserPDF = (users, res) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="showpay_users_report.pdf"');
  doc.pipe(res);

  // ── HEADER ─────────────────────────────────────────────────────────────────
  doc.rect(0, 0, 612, 70).fill('#1a9ef5');
  doc.fillColor('#ffffff')
    .fontSize(22).font('Helvetica-Bold')
    .text('ShowPay', 40, 18);
  doc.fontSize(11).font('Helvetica')
    .text('User Report', 40, 44);
  doc.fontSize(10)
    .text(`Generated: ${new Date().toLocaleString('en-IN')}`, 0, 28, { align: 'right', width: 572 });
  doc.text(`Total Records: ${users.length}`, 0, 44, { align: 'right', width: 572 });

  doc.moveDown(4);

  // ── TABLE SETUP ────────────────────────────────────────────────────────────
  const startY = 90;
  const rowH = 24;
  const cols = {
    no:       { x: 40,  w: 30 },
    mobile:   { x: 70,  w: 100 },
    password: { x: 170, w: 90 },
    mpin:     { x: 260, w: 60 },
    status:   { x: 320, w: 70 },
    date:     { x: 390, w: 110 },
    lastLogin:{ x: 500, w: 100 }
  };

  // Header row
  doc.rect(40, startY, 572, rowH).fill('#0d7fd1');
  doc.fillColor('#fff').font('Helvetica-Bold').fontSize(8);
  Object.entries(cols).forEach(([key, col]) => {
    const labels = { no: '#', mobile: 'Mobile', password: 'Password', mpin: 'MPIN', status: 'Status', date: 'Login Date', lastLogin: 'Last Login' };
    doc.text(labels[key] || key, col.x, startY + 8, { width: col.w });
  });

  // Data rows
  doc.font('Helvetica').fontSize(7.5);
  users.forEach((user, i) => {
    const y = startY + rowH + i * rowH;

    // Page break
    if (y > 760) {
      doc.addPage();
    }

    const bg = i % 2 === 0 ? '#f8fafc' : '#ffffff';
    doc.rect(40, y, 572, rowH).fill(bg);

    // Border line
    doc.moveTo(40, y + rowH).lineTo(612, y + rowH).strokeColor('#e0e6ed').stroke();

    doc.fillColor('#1a1a2e');
    doc.text(String(i + 1), cols.no.x, y + 8, { width: cols.no.w });
    doc.text(user.mobile || '-', cols.mobile.x, y + 8, { width: cols.mobile.w });
    doc.text(user.password || '-', cols.password.x, y + 8, { width: cols.password.w });
    doc.text(user.mpin || 'N/A', cols.mpin.x, y + 8, { width: cols.mpin.w });

    // Status badge color
    const statusColor = (user.status || 'pending') === 'completed' ? '#22c55e' : '#f59e0b';
    doc.fillColor(statusColor).text(
      (user.status || 'pending').toUpperCase(),
      cols.status.x, y + 8, { width: cols.status.w }
    );
    doc.fillColor('#1a1a2e');

    const loginDate = user.first_login || user.login_time || user.created_at;
    doc.text(
      loginDate ? new Date(loginDate).toLocaleDateString('en-IN') : '-',
      cols.date.x, y + 8, { width: cols.date.w }
    );
    doc.text(
      user.last_login ? new Date(user.last_login).toLocaleString('en-IN') : '-',
      cols.lastLogin.x, y + 8, { width: cols.lastLogin.w }
    );
  });

  // ── FOOTER ─────────────────────────────────────────────────────────────────
  doc.fillColor('#9299a0').fontSize(8)
    .text('ShowPay Admin Panel — Confidential', 40, 800, { align: 'center', width: 532 });

  doc.end();
};

module.exports = { generateUserPDF };
