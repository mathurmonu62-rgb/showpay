const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const User = require('./models/User');
const { generateUserPDF } = require('./utils/pdf');

async function createReport() {
  console.log('─── FETCHING USER DATA FROM SUPABASE ───');
  try {
    const result = await User.findAll({ limit: 100 });
    console.log(`✅ Successfully fetched ${result.users.length} users from Supabase.`);
    
    const outputPath = path.resolve(__dirname, '../ShowPay_User_Report.pdf');
    const writeStream = fs.createWriteStream(outputPath);
    
    // Create a mock response object that behaves like Express res but pipes to file stream
    const mockRes = {
      setHeader: (key, value) => console.log(`[Header] ${key}: ${value}`),
      on: (event, handler) => writeStream.on(event, handler),
      once: (event, handler) => writeStream.once(event, handler),
      emit: (event, data) => writeStream.emit(event, data),
      write: (chunk) => writeStream.write(chunk),
      end: () => writeStream.end()
    };
    
    writeStream.on('finish', () => {
      console.log(`\n✅ PDF Report successfully generated at: ${outputPath}`);
      process.exit(0);
    });
    
    generateUserPDF(result.users, mockRes);
  } catch (err) {
    console.error('❌ Error generating PDF report:', err.message);
    process.exit(1);
  }
}

createReport();
