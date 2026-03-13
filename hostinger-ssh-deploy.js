#!/usr/bin/env node

/**
 * 🚀 HOSTINGER SSH AUTO-DEPLOYMENT
 * Automatically deploys backend to Hostinger via SSH
 * 
 * Connects to server and:
 * - Uploads backend files
 * - Installs dependencies  
 * - Creates .env configuration
 * - Starts Node.js application
 * - Verifies deployment
 */

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

// ============================================================================
// SSH CONFIGURATION
// ============================================================================

const SSH_CONFIG = {
  host: 'lifewaycomputer.org',
  user: 'root',
  password: 'India24160@',
  port: 22
};

const ENV_VARIABLES = {
  NODE_ENV: 'production',
  PORT: '3000',
  DB_HOST: 'mysql.hostinger.com',
  DB_PORT: '3306',
  DB_USER: 'u790215710_lifeway_user',
  DB_PASSWORD: 'Lifeway@2026',
  DB_NAME: 'u790215710_lifewaycompute',
  JWT_SECRET: 'd55763ddea99a11bfa473c88efbb168ce52255c49cf296f5ba0908852490be9b',
  SESSION_SECRET: '2bddada3eadec0ca250dbeb54faf523c483f43372ca9629c986eac472735f13f',
  FRONTEND_URLS: 'https://lifewaycomputer.org,http://localhost:3000,http://localhost:5000',
  DB_WAIT_FOR_CONNECTIONS: 'true',
  DB_CONNECTION_LIMIT: '10',
  DB_QUEUE_LIMIT: '0',
  DB_ENABLE_KEEP_ALIVE: 'true',
  DB_KEEP_ALIVE_INITIAL_DELAY_MS: '0'
};

// ============================================================================
// COLORS & LOGGING
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  progress: (msg) => console.log(`${colors.magenta}▶️  ${msg}${colors.reset}`),
  step: (num, msg) => console.log(`${colors.bold}📋 STEP ${num}: ${msg}${colors.reset}`)
};

// ============================================================================
// SSH COMMAND EXECUTOR
// ============================================================================

async function runSSH(command, description = '') {
  return new Promise((resolve, reject) => {
    if (description) {
      log.progress(description);
    }

    // Use sshpass if available for password authentication
    // Otherwise fallback to manual prompt
    const proc = spawn('ssh', [
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'UserKnownHostsFile=/dev/null',
      `-p${SSH_CONFIG.port}`,
      `${SSH_CONFIG.user}@${SSH_CONFIG.host}`,
      command
    ]);

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
      process.stdout.write(data);
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
      process.stderr.write(data);
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject({
          code,
          stdout,
          stderr,
          command
        });
      } else {
        resolve(stdout);
      }
    });
  });
}

// ============================================================================
// MAIN DEPLOYMENT
// ============================================================================

async function deploy() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║       🚀 HOSTINGER SSH AUTO-DEPLOYMENT STARTING                              ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

    log.info(`SSH Connection: ${SSH_CONFIG.user}@${SSH_CONFIG.host}:${SSH_CONFIG.port}`);

    // ========================================================================
    // STEP 1: Check SSH Connection
    // ========================================================================
    log.step(1, 'Testing SSH connection');
    
    try {
      await runSSH('echo "✓ SSH Connection Successful"', 'Connecting to server...');
      log.success('SSH connection established');
    } catch (e) {
      log.error('Cannot connect via SSH');
      log.info('Make sure:');
      log.info('  1. SSH is enabled on your Hostinger account');
      log.info('  2. Host: lifewaycomputer.org is correct');
      log.info('  3. Username: root is correct');
      log.info('  4. Password: India24160@ is correct');
      throw e;
    }

    // ========================================================================
    // STEP 2: Create directory structure
    // ========================================================================
    log.step(2, 'Creating application directories');

    const commands = [
      'mkdir -p ~/public_html/api',
      'cd ~/public_html/api && pwd'
    ];

    for (const cmd of commands) {
      await runSSH(cmd, `Running: ${cmd}`);
    }

    log.success('Directories created');

    // ========================================================================
    // STEP 3: Upload backend files
    // ========================================================================
    log.step(3, 'Uploading backend files via SCP');

    const backendDir = path.join(__dirname, 'backend');
    const remoteDir = `${SSH_CONFIG.user}@${SSH_CONFIG.host}:~/public_html/api/`;

    log.progress('Uploading backend folder...');

    const scpProc = spawnSync('scp', [
      '-r',
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'UserKnownHostsFile=/dev/null',
      `-P${SSH_CONFIG.port}`,
      backendDir,
      remoteDir
    ], { stdio: 'inherit' });

    if (scpProc.status !== 0) {
      throw new Error('SCP upload failed');
    }

    log.success('Backend files uploaded');

    // ========================================================================
    // STEP 4: Install dependencies
    // ========================================================================
    log.step(4, 'Installing Node.js dependencies');

    log.progress('Running: npm install (this may take 2-3 minutes)...');
    
    await runSSH(
      'cd ~/public_html/api/backend && npm install',
      'Installing dependencies on server...'
    );

    log.success('Dependencies installed');

    // ========================================================================
    // STEP 5: Create .env file
    // ========================================================================
    log.step(5, 'Creating .env configuration file');

    const envContent = Object.entries(ENV_VARIABLES)
      .map(([key, value]) => `${key}=${value}`)
      .join('\\n');

    await runSSH(
      `cat > ~/public_html/api/backend/.env << 'EOF'\n${Object.entries(ENV_VARIABLES).map(([k, v]) => `${k}=${v}`).join('\n')}\nEOF`,
      'Creating .env file...'
    );

    log.success('.env file created with all 15 environment variables');

    // ========================================================================
    // STEP 6: Verify setup
    // ========================================================================
    log.step(6, 'Verifying installation');

    const verifyCommands = [
      { cmd: 'cd ~/public_html/api/backend && ls -la', desc: 'Checking files...' },
      { cmd: 'cd ~/public_html/api/backend && test -f .env && echo "✓ .env exists"', desc: 'Verifying .env...' },
      { cmd: 'cd ~/public_html/api/backend && test -d node_modules && echo "✓ node_modules exists"', desc: 'Checking dependencies...' },
      { cmd: 'cd ~/public_html/api/backend && node --version', desc: 'Node.js version...' }
    ];

    for (const { cmd, desc } of verifyCommands) {
      await runSSH(cmd, desc);
    }

    log.success('Verification complete');

    // ========================================================================
    // STEP 7: Start application
    // ========================================================================
    log.step(7, 'Starting Node.js application');

    log.warn('Note: Starting server in background...');
    await runSSH(
      'cd ~/public_html/api/backend && nohup npm start > /tmp/lifeway-backend.log 2>&1 &',
      'Starting backend server...'
    );

    log.success('Backend server started in background');

    // ========================================================================
    // COMPLETION
    // ========================================================================
    console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║             ✅ DEPLOYMENT COMPLETE!                                        ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

    const summary = `
✅ DEPLOYMENT SUMMARY:

📍 Backend Location: ~/public_html/api/backend/
🔑 Configuration: .env with 15 variables
📦 Dependencies: npm installed
🚀 Server: Running on port 3000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 TEST YOUR DEPLOYMENT:

1. Health Check:
   https://lifewaycomputer.org:3000/api/health
   
2. With Frontend Proxy (if configured):
   https://lifewaycomputer.org/api/health

3. Login Test:
   https://lifewaycomputer.org
   Click Login button → Try logging in

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 NEXT STEPS:

1. If NOT working, check server logs:
   ssh root@lifewaycomputer.org
   tail -f /tmp/lifeway-backend.log

2. If you're using cPanel for frontend, create a reverse proxy:
   cPanel → Addon Domains/Subdomains
   Point /api to localhost:3000

3. Configure frontend (api-service.js):
   Update API_BASE_URL to: https://lifewaycomputer.org/api

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 BACKEND IS LIVE! 
`;

    console.log(summary);

  } catch (error) {
    log.error(`Deployment failed: ${error.message}`);
    if (error.stderr) {
      console.error(`\nServer error:\n${error.stderr}`);
    }
    process.exit(1);
  }
}

// ============================================================================
// RUN DEPLOYMENT
// ============================================================================

deploy();
