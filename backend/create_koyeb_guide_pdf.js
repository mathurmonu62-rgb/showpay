const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function generateKoyebGuide() {
  const outputPath = path.resolve(__dirname, '../Koyeb_Live_Deployment_Guide.pdf');
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const writeStream = fs.createWriteStream(outputPath);

  doc.pipe(writeStream);

  // ── HEADER ─────────────────────────────────────────────────────────────────
  doc.rect(0, 0, 612, 100).fill('#121212'); // Koyeb Dark Theme Header
  doc.fillColor('#00c853') // Koyeb vibrant green
    .fontSize(28).font('Helvetica-Bold')
    .text('KOYEB DEPLOYMENT GUIDE', 50, 30);
  doc.fillColor('#ffffff')
    .fontSize(14).font('Helvetica')
    .text('Complete Step-by-Step Tutorial to Deploy ShowPay Full-Stack App Live', 50, 68);

  doc.moveDown(3);

  // ── INTRODUCTION ───────────────────────────────────────────────────────────
  doc.fillColor('#1a1a2e').fontSize(16).font('Helvetica-Bold')
    .text('1. Why Koyeb & How It Works');
  doc.moveDown(0.5);
  doc.fillColor('#4a4a4a').fontSize(11).font('Helvetica').lineGap(4)
    .text('Koyeb is a high-performance serverless cloud platform. Your ShowPay project has been engineered to run both the Node.js Backend API and the React Frontend UI from a single unified Koyeb service.');
  doc.text('• Root package.json automatically installs both backend and frontend dependencies via postinstall.');
  doc.text('• Express server automatically serves the compiled static React app from frontend/dist.');
  doc.text('• Zero CORS errors and zero 404 Vercel routing issues!');

  doc.moveDown(1.5);

  // ── STEP BY STEP GUIDE ─────────────────────────────────────────────────────
  doc.fillColor('#1a1a2e').fontSize(16).font('Helvetica-Bold')
    .text('2. Step-by-Step Live Deployment Steps');
  
  doc.moveDown(0.5);
  doc.fillColor('#1a1a2e').fontSize(12).font('Helvetica-Bold')
    .text('Step 1: Create Koyeb Account & Connect GitHub');
  doc.fillColor('#4a4a4a').fontSize(11).font('Helvetica').lineGap(4)
    .text('1. Go to https://www.koyeb.com and log in with your GitHub account.');
  doc.text('2. Click on the "Create Web Service" button on the dashboard.');
  doc.text('3. Select "GitHub" as the deployment method and pick your repository: mathurmonu62-rgb/showpay.');

  doc.moveDown(1);
  doc.fillColor('#1a1a2e').fontSize(12).font('Helvetica-Bold')
    .text('Step 2: Configure Build & Execution Settings');
  doc.fillColor('#4a4a4a').fontSize(11).font('Helvetica').lineGap(4)
    .text('Koyeb will automatically detect your Node.js environment from package.json.');
  doc.text('• Build Command: Koyeb automatically runs npm install and npm run build.');
  doc.text('• Start Command: Koyeb automatically runs npm start (which triggers node server.js).');
  doc.text('• Port: Leave the default port or set it to 8080 (Koyeb injects the PORT environment variable).');

  doc.moveDown(1);
  doc.fillColor('#1a1a2e').fontSize(12).font('Helvetica-Bold')
    .text('Step 3: Enter Environment Variables (CRITICAL)');
  doc.fillColor('#4a4a4a').fontSize(11).font('Helvetica').lineGap(4)
    .text('In the "Environment variables" tab on Koyeb, add the following key-value pairs:');
  
  doc.moveDown(0.5);
  // Environment variables box
  doc.rect(50, doc.y, 512, 120).fill('#f8f9fa');
  doc.fillColor('#1a1a2e').fontSize(10).font('Courier-Bold').lineGap(6);
  doc.text('PORT                 = 8080', 65, doc.y + 12);
  doc.text('JWT_SECRET           = showpay_jwt_secret_key_2024_very_secure', 65, doc.y);
  doc.text('SUPABASE_URL         = https://fuqdoqqoagtlmcqpslkg.supabase.co', 65, doc.y);
  doc.text('SUPABASE_SERVICE_KEY = sb_publishable_vpExmZZBdY9v5410CmFA2Q_Ik2iKVIc', 65, doc.y);
  doc.text('ADMIN_EMAIL          = admin@showpay.com', 65, doc.y);
  doc.text('ADMIN_PASSWORD       = admin@0123', 65, doc.y);

  doc.moveDown(3);

  doc.fillColor('#1a1a2e').fontSize(12).font('Helvetica-Bold')
    .text('Step 4: Click Deploy & Launch Live');
  doc.fillColor('#4a4a4a').fontSize(11).font('Helvetica').lineGap(4)
    .text('1. Click the green "Deploy" button at the bottom.');
  doc.text('2. Koyeb will provision a secure container, build your React frontend, start your Express backend, and provide a secure HTTPS URL (e.g., https://showpay-app.koyeb.app).');
  doc.text('3. Open your new URL, log in, and enjoy your fully functional full-stack live application!');

  // ── FOOTER ─────────────────────────────────────────────────────────────────
  doc.fillColor('#9299a0').fontSize(9).font('Helvetica')
    .text('ShowPay Project — Automated Cloud Engineering Guide', 50, 780, { align: 'center', width: 512 });

  doc.end();

  writeStream.on('finish', () => {
    console.log(`\n✅ Koyeb Live Deployment Guide PDF successfully generated at: ${outputPath}`);
  });
}

generateKoyebGuide();
