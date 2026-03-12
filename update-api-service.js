#!/usr/bin/env node

/**
 * 🔧 UPDATE API-SERVICE.JS WITH RENDER URL
 * 
 * This script will automatically update your api-service.js with the Render URL
 * Run this AFTER your Render deployment is complete
 * 
 * Usage: node update-api-service.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

function question(q) {
  return new Promise(resolve => {
    rl.question(q, resolve);
  });
}

async function main() {
  log('\n🔧 API SERVICE URL UPDATE SCRIPT\n', 'bright');
  
  log('This script updates api-service.js with your Render URL\n', 'cyan');
  
  // Ask for Render URL
  log('After your Render deployment completes:', 'yellow');
  log('- Go to Render Dashboard');
  log('- Select: lifeway-backend');
  log('- Copy the URL from the top (format: https://yourapp.onrender.com)\n', 'yellow');
  
  const renderUrl = await question(colors.bright + 'Paste your Render URL: ' + colors.reset);
  
  if (!renderUrl || !renderUrl.includes('onrender.com')) {
    log('\n❌ Invalid URL! Must be a Render URL (*.onrender.com)\n', 'red');
    rl.close();
    return;
  }
  
  // Construct API URL
  const apiUrl = `${renderUrl}/api`;
  
  log(`\n✅ Render URL: ${renderUrl}`, 'green');
  log(`✅ API URL: ${apiUrl}\n`, 'green');
  
  // Find api-service.js
  const apiServicePath = path.join(__dirname, 'api-service.js');
  
  if (!fs.existsSync(apiServicePath)) {
    log(`❌ Error: api-service.js not found at ${apiServicePath}\n`, 'red');
    rl.close();
    return;
  }
  
  log(`✅ Found api-service.js\n`, 'green');
  
  // Read current file
  const content = fs.readFileSync(apiServicePath, 'utf-8');
  
  // Find and replace the API_BASE_URL
  const pattern = /const API_BASE_URL = window\.location\.hostname === 'localhost'\s*\?\s*'http:\/\/localhost:3000\/api'\s*:\s*'https:\/\/[^']+\/api';/;
  
  if (!pattern.test(content)) {
    log('⚠️  Could not find API_BASE_URL pattern in api-service.js\n', 'yellow');
    log('Manual update needed:', 'bright');
    log(`Find this line:\n`, 'cyan');
    log(`  const API_BASE_URL = window.location.hostname === 'localhost'`, 'yellow');
    log(`    ? 'http://localhost:3000/api'`, 'yellow');
    log(`    : 'https://your-render-app-name.onrender.com/api';\n`, 'yellow');
    log(`Replace with:\n`, 'cyan');
    log(`  const API_BASE_URL = window.location.hostname === 'localhost'`, 'yellow');
    log(`    ? 'http://localhost:3000/api'`, 'yellow');
    log(`    : '${apiUrl}';\n`, 'yellow');
    rl.close();
    return;
  }
  
  // Replace the URL
  const updated = content.replace(
    pattern,
    `const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '${apiUrl}';`
  );
  
  // Write back
  fs.writeFileSync(apiServicePath, updated, 'utf-8');
  
  log(`✅ api-service.js updated successfully!\n`, 'green');
  log(`API URL changed to: ${apiUrl}\n`, 'green');
  
  log('Next steps:', 'bright');
  log('1. Upload updated api-service.js to Hostinger', 'cyan');
  log('   - Use File Manager or FTP');
  log('   - Replace /api-service.js\n', 'cyan');
  log('2. Go to: https://lifewaycomputer.org', 'cyan');
  log('3. Click Login', 'cyan');
  log('4. Should work without errors!\n', 'cyan');
  
  log('✨ Done!\n', 'green');
  
  rl.close();
}

main().catch(err => {
  log(`\n❌ Error: ${err.message}\n`, 'red');
  process.exit(1);
});
