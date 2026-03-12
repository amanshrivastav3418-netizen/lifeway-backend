#!/usr/bin/env node

/**
 * 🚀 Lifeway Backend - Interactive Deployment Setup Script
 * 
 * This script guides you through setting up environment variables
 * for production deployment on Render.com with Hostinger database.
 * 
 * Usage: node setup-deployment.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log('\n' + '='.repeat(70), 'cyan');
  log(title, 'cyan');
  log('='.repeat(70) + '\n', 'cyan');
}

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function main() {
  log('\n🚀 Lifeway Computers Backend - Production Deployment Setup\n', 'bright');
  log('This script will help you configure environment variables for Render deployment.\n');
  log('ℹ️  You\'ll need your Hostinger MySQL database credentials.\n', 'yellow');

  // Step 1: Hostinger Database
  logSection('STEP 1: Hostinger MySQL Database Information');
  
  log('Go to Hostinger cPanel → Databases → MySQL Databases');
  log('Find your database details and enter them below:\n', 'yellow');

  const dbHost = await question(colors.bright + 'MySQL Host (e.g., mysql.hostinger.com): ' + colors.reset);
  const dbPort = await question(colors.bright + 'MySQL Port (default 3306): ' + colors.reset) || '3306';
  const dbUser = await question(colors.bright + 'Database Username: ' + colors.reset);
  const dbPassword = await question(colors.bright + 'Database Password: ' + colors.reset);
  const dbName = await question(colors.bright + 'Database Name: ' + colors.reset);

  // Step 2: Frontend Domain
  logSection('STEP 2: Frontend Configuration');
  
  log('Enter your Hostinger frontend domain:\n', 'yellow');
  
  const hostingerDomain = await question(colors.bright + 'Hostinger Domain (e.g., https://mysite.com): ' + colors.reset);
  const localDevUrl = await question(colors.bright + 'Local Dev URL (default http://localhost:5000): ' + colors.reset) || 'http://localhost:5000';

  // Step 3: Generate Secrets
  logSection('STEP 3: Generating Security Secrets');
  
  log('Generating secure JWT and Session secrets...\n', 'yellow');
  
  const jwtSecret = generateSecret(32);
  const sessionSecret = generateSecret(32);

  log('✅ JWT_SECRET generated (32 random chars)\n', 'green');
  log('✅ SESSION_SECRET generated (32 random chars)\n', 'green');

  // Step 4: Render Information
  logSection('STEP 4: Render.com Service Information');
  
  log('After deploying to Render, you\'ll get a service URL.\n', 'yellow');
  
  const renderAppName = await question(colors.bright + 'Render App Name (will be: yourname.onrender.com): ' + colors.reset) || 'lifeway-backend';
  const renderRegion = await question(colors.bright + 'Render Region - (Choose from: oregon, ohio, frankfurt, singapore, mumbai, etc.): ' + colors.reset) || 'frankfurt';

  // Step 5: Confirmation
  logSection('STEP 5: Review Configuration');
  
  log('\n📋 Configuration Summary:\n', 'cyan');
  
  log('DATABASE CONNECTION:', 'bright');
  log(`  Host: ${dbHost}`);
  log(`  Port: ${dbPort}`);
  log(`  User: ${dbUser}`);
  log(`  Database: ${dbName}\n`);
  
  log('FRONTEND URLS:', 'bright');
  log(`  Production: ${hostingerDomain}`);
  log(`  Development: ${localDevUrl}\n`);
  
  log('RENDER DEPLOYMENT:', 'bright');
  log(`  App Name: ${renderAppName}`);
  log(`  Region: ${renderRegion}`);
  log(`  URL: https://${renderAppName}.onrender.com\n`);
  
  log('SECURITY:', 'bright');
  log('  JWT_SECRET: ✅ Generated');
  log('  SESSION_SECRET: ✅ Generated\n');

  const confirm = await question(colors.yellow + 'Does this look correct? (yes/no): ' + colors.reset);

  if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
    log('\n❌ Setup cancelled. Please run again.\n', 'red');
    rl.close();
    return;
  }

  // Step 6: Generate .env file
  logSection('STEP 6: Generating Environment Files');

  const envContent = `# ============================================================================
# LIFEWAY COMPUTERS - RENDER.COM DEPLOYMENT CONFIGURATION
# ============================================================================
# Generated: ${new Date().toISOString()}
# DO NOT COMMIT THIS FILE TO GIT!
# ============================================================================

# ============================================================================
# Server Configuration
# ============================================================================
NODE_ENV=production
PORT=3000

# ============================================================================
# Hostinger MySQL Database Configuration
# ============================================================================
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=${dbName}

# ============================================================================
# Database Connection Pool Configuration
# ============================================================================
DB_WAIT_FOR_CONNECTIONS=true
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0
DB_ENABLE_KEEP_ALIVE=true
DB_KEEP_ALIVE_INITIAL_DELAY_MS=0

# ============================================================================
# Frontend Configuration
# ============================================================================
FRONTEND_URL=${hostingerDomain}
FRONTEND_URLS=${hostingerDomain},${localDevUrl}

# ============================================================================
# JWT Authentication
# ============================================================================
JWT_SECRET=${jwtSecret}
JWT_EXPIRE=7d

# ============================================================================
# Session Configuration
# ============================================================================
SESSION_SECRET=${sessionSecret}

# ============================================================================
# File Upload Configuration
# ============================================================================
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# ============================================================================
# CORS Settings
# ============================================================================
CORS_ORIGIN=${hostingerDomain}
CORS_CREDENTIALS=true`;

  const envPath = path.join(__dirname, '.env');
  
  try {
    fs.writeFileSync(envPath, envContent);
    log(`✅ .env file created successfully!\n`, 'green');
    log(`   Location: ${envPath}\n`, 'cyan');
  } catch (err) {
    log(`❌ Error creating .env file: ${err.message}\n`, 'red');
    rl.close();
    return;
  }

  // Step 7: Generate Render Environment Variables Template
  logSection('STEP 7: Render Environment Variables Template');

  const renderEnvTemplate = `# Copy these variables to Render Dashboard:
# 1. Go to Render.com Dashboard
# 2. Select your service: ${renderAppName}
# 3. Go to "Environment" section
# 4. Click "Add Environment Variable" for each line below:

NODE_ENV=production
PORT=3000
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=${dbName}
JWT_SECRET=${jwtSecret}
SESSION_SECRET=${sessionSecret}
FRONTEND_URLS=${hostingerDomain},${localDevUrl}
DB_WAIT_FOR_CONNECTIONS=true
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0
DB_ENABLE_KEEP_ALIVE=true
DB_KEEP_ALIVE_INITIAL_DELAY_MS=0`;

  const renderPath = path.join(__dirname, 'RENDER_ENV_VARIABLES.txt');
  
  try {
    fs.writeFileSync(renderPath, renderEnvTemplate);
    log(`✅ Render environment variables template created!\n`, 'green');
    log(`   Location: ${renderPath}\n`, 'cyan');
  } catch (err) {
    log(`❌ Error creating Render template: ${err.message}\n`, 'red');
  }

  // Step 8: Next Steps
  logSection('✨ Setup Complete! Next Steps:');

  log('1️⃣  Verify .env file was created with your values:', 'bright');
  log('   cat .env\n');

  log('2️⃣  Test locally before deploying:', 'bright');
  log('   npm install');
  log('   npm start');
  log('   Test: curl http://localhost:3000/api/health\n');

  log('3️⃣  Initialize Git (if not done):', 'bright');
  log('   git init');
  log('   git add .');
  log('   git commit -m "Initial commit: Ready for Render"\n');

  log('4️⃣  Push to GitHub:', 'bright');
  log('   git branch -M main');
  log('   git remote add origin https://github.com/YOUR_USERNAME/lifeway-backend');
  log('   git push -u origin main\n');

  log('5️⃣  Deploy to Render:', 'bright');
  log('   - Go to https://dashboard.render.com');
  log('   - Click "New +" → "Web Service"');
  log('   - Select your GitHub repository');
  log('   - Add environment variables from RENDER_ENV_VARIABLES.txt');
  log('   - Click "Create Web Service"\n');

  log('6️⃣  After Render deployment:', 'bright');
  log('   - Check Render logs for database connection');
  log('   - Test: curl https://' + renderAppName + '.onrender.com/api/health');
  log('   - Update api-service.js with your Render URL\n');

  log('📚 Full guide: Read DEPLOYMENT_GUIDE_INTERACTIVE.md\n', 'cyan');
  log('📋 Verification: Use DEPLOYMENT_CHECKLIST.md to verify all steps\n', 'cyan');

  log('⚠️  IMPORTANT: Never commit .env to Git!\n', 'yellow');
  log('   Check .gitignore includes: .env\n', 'yellow');

  log('✅ Your backend is ready for deployment!\n', 'green');

  rl.close();
}

// Run the script
main().catch(err => {
  log(`\n❌ Error: ${err.message}\n`, 'red');
  process.exit(1);
});
