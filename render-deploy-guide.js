#!/usr/bin/env node

/**
 * 🚀 LIFEWAY BACKEND - RENDER DEPLOYMENT AUTOMATION
 * 
 * This script prepares and deploys your backend to Render.com
 * 
 * Prerequisites:
 * - GitHub account with code pushed (✅ DONE)
 * - Render account (create at https://render.com)
 * - GitHub connected to Render
 * 
 * Usage: node render-deploy.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function logSection(title) {
  log('\n' + '='.repeat(80), 'cyan');
  log(title, 'cyan');
  log('='.repeat(80) + '\n', 'cyan');
}

logSection('🚀 LIFEWAY BACKEND - RENDER DEPLOYMENT SETUP');

log('\n📋 DEPLOYMENT CHECKLIST\n', 'bright');

log('STEP 1: Create Render Account', 'bright');
log('  If you don\'t have one, create FREE account at: https://render.com', 'cyan');
log('  ✓ Go to https://render.com/register');
log('  ✓ Sign up with email or GitHub');
log('  ✓ Verify email');
log('  ✓ Create account\n', 'green');

log('STEP 2: Connect GitHub to Render', 'bright');
log('  After creating account:');
log('  ✓ Go to Account Settings → Connections');
log('  ✓ Click "Connect GitHub"');
log('  ✓ Authorize Render to access your GitHub');
log('  ✓ Select your GitHub account\n', 'green');

log('STEP 3: Create Web Service on Render', 'bright');
log('  ✓ Go to: https://dashboard.render.com');
log('  ✓ Click "New +" → "Web Service"');
log('  ✓ Click "Connect GitHub"');
log('  ✓ Search for: lifeway-backend');
log('  ✓ Click "Connect"\n', 'green');

log('STEP 4: Configure Web Service', 'bright');
log('  Fill these fields exactly:');
log('  ┌─────────────────────────────────────┐');
log('  │ Name: lifeway-backend               │', 'yellow');
log('  │ Environment: Node                   │', 'yellow');
log('  │ Region: AWS Frankfurt (or Ohio)     │', 'yellow');
log('  │ Plan: Free                          │', 'yellow');
log('  │ Build: npm install                  │', 'yellow');
log('  │ Start: npm start                    │', 'yellow');
log('  └─────────────────────────────────────┘\n', 'yellow');

log('STEP 5: Add ALL Environment Variables', 'bright');
log('  CRITICAL! On the form, scroll to "Environment" and add:', 'red');
log('  Click "Add Environment Variable" for EACH line:\n', 'yellow');

const envVars = [
  'NODE_ENV=production',
  'PORT=3000',
  'DB_HOST=mysql.hostinger.com',
  'DB_PORT=3306',
  'DB_USER=u790215710_lifeway_user',
  'DB_PASSWORD=Lifeway@2026',
  'DB_NAME=u790215710_lifewaycompute',
  'JWT_SECRET=d55763ddea99a11bfa473c88efbb168ce52255c49cf296f5ba0908852490be9b',
  'SESSION_SECRET=2bddada3eadec0ca250dbeb54faf523c483f43372ca9629c986eac472735f13f',
  'FRONTEND_URLS=https://lifewaycomputer.org,http://localhost:3000,http://localhost:5000',
  'DB_WAIT_FOR_CONNECTIONS=true',
  'DB_CONNECTION_LIMIT=10',
  'DB_QUEUE_LIMIT=0',
  'DB_ENABLE_KEEP_ALIVE=true',
  'DB_KEEP_ALIVE_INITIAL_DELAY_MS=0'
];

envVars.forEach((env, idx) => {
  const [key, value] = env.split('=');
  log(`  ${idx + 1}. ${key.padEnd(35)} = ${value.substring(0, 30)}${value.length > 30 ? '...' : ''}`, 'cyan');
});

log('\n⚠️  VERY IMPORTANT:\n', 'red');
log('  1. Add ALL 15 environment variables above');
log('  2. Copy them EXACTLY as shown');
log('  3. Do NOT create service yet - add variables FIRST');
log('  4. Then click "Create Web Service"\n', 'yellow');

log('STEP 6: Wait for Deployment', 'bright');
log('  Render will now:');
log('  ✓ Build the application (2-3 minutes)');
log('  ✓ Install dependencies');
log('  ✓ Start the server');
log('  ✓ Status: Building... → Live\n', 'green');

log('STEP 7: Get Your Render URL', 'bright');
log('  Once "Live" (green):');
log('  ✓ Copy the URL from top of page');
log('  ✓ Example: https://lifeway-backend.onrender.com');
log('  ✓ SAVE THIS URL - you need it for frontend!\n', 'green');

log('STEP 8: Test Health Endpoint', 'bright');
log('  In browser, go to:');
log('  https://lifeway-backend.onrender.com/api/health\n', 'yellow');
log('  You should see JSON response:\n', 'cyan');
log('  {', 'yellow');
log('    "status": "Server is running",', 'yellow');
log('    "timestamp": "...",', 'yellow');
log('    "uptime": 45.67,', 'yellow');
log('    "environment": "production"', 'yellow');
log('  }\n', 'yellow');

log('✅ If you see this, your backend is LIVE!\n', 'green');

log('STEP 9: Update Frontend API URL', 'bright');
log('  Edit: /api-service.js (in root)');
log('  Find line with API_BASE_URL');
log('  Replace YOUR_APP with your Render URL:');
log('  Example: https://lifeway-backend.onrender.com/api\n', 'yellow');

log('STEP 10: Upload to Hostinger', 'bright');
log('  ✓ Upload updated api-service.js to Hostinger');
log('  ✓ Use File Manager or FTP');
log('  ✓ Replace the old api-service.js\n', 'green');

log('STEP 11: Test Login', 'bright');
log('  ✓ Go to https://lifewaycomputer.org');
log('  ✓ Click Login');
log('  ✓ Should work without errors');
log('  ✓ Try loading student list\n', 'green');

logSection('📊 SUMMARY');

log('GitHub Repository: https://github.com/amanshrivastav3418-netizen/lifeway-backend', 'cyan');
log('Render Dashboard: https://dashboard.render.com', 'cyan');
log('Expected Result: Backend running on Render (Free Tier)', 'cyan');
log('Time to Complete: 15-20 minutes\n', 'cyan');

logSection('⏭️  NEXT STEPS');

log('1. Create Render account (if needed)\n', 'bright');
log('2. Go to https://dashboard.render.com\n', 'bright');
log('3. Create Web Service\n', 'bright');
log('4. Connect GitHub: amanshrivastav3418-netizen/lifeway-backend\n', 'bright');
log('5. Add ALL 15 environment variables (copy from above)\n', 'bright');
log('6. Click "Create Web Service"\n', 'bright');
log('7. Wait for deployment (2-3 minutes)\n', 'bright');
log('8. Update api-service.js with Render URL\n', 'bright');
log('9. Upload to Hostinger\n', 'bright');
log('10. Test login on frontend\n', 'bright');

logSection('🎉 YOU\'RE READY!');

log('Your backend is on GitHub and ready to deploy!', 'green');
log('\nGo to: https://dashboard.render.com to start deploying\n', 'green');
log('Questions? Check RENDER_DEPLOYMENT_INSTRUCTIONS.md\n', 'cyan');
