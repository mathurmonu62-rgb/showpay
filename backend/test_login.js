const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const supabase = require('./config/supabase');

async function runTests() {
  console.log('─── 1. CHECKING ENVIRONMENT VARIABLES ───');
  const requiredVars = ['PORT', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
  const missing = requiredVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
  } else {
    console.log('✅ All required environment variables are loaded successfully!');
  }

  console.log('\n─── 2. CHECKING SUPABASE DATABASE CONNECTION ───');
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      console.error('❌ Supabase connection error:', error.message);
    } else {
      console.log('✅ Supabase database connection verified successfully!');
    }
  } catch (err) {
    console.error('❌ Supabase connection exception:', err.message);
  }

  console.log('\n─── 3. STARTING BACKEND SERVER & TESTING LOGIN API ───');
  const serverProcess = spawn('node', ['server.js'], { cwd: __dirname });

  serverProcess.stdout.on('data', (data) => {
    console.log(`[SERVER STDOUT] ${data.toString().trim()}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[SERVER STDERR] ${data.toString().trim()}`);
  });

  // Wait 2 seconds for server to start up and bind to port
  setTimeout(async () => {
    const PORT = process.env.PORT || 8080;
    const loginUrl = `http://localhost:${PORT}/api/auth/login`;
    console.log(`\nTesting POST ${loginUrl} with valid 8-char password...`);
    
    try {
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Using an 8-character password to respect the database VARCHAR(10) schema
        body: JSON.stringify({ mobile: '8778578578', password: 'pass1234' })
      });
      
      const data = await res.json();
      console.log('\n[LOGIN API RESPONSE]:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('\n✅ /api/auth/login verified and working flawlessly!');
      } else {
        console.error('\n❌ Login API returned failure:', data.message);
      }
    } catch (err) {
      console.error('\n❌ Failed to connect to Login API:', err.message);
    } finally {
      // Clean up server process
      serverProcess.kill();
      process.exit(0);
    }
  }, 2000);
}

runTests();
