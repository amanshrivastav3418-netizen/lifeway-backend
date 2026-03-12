#!/usr/bin/env node

/**
 * 🚀 LIFEWAY BACKEND - AUTOMATED DEPLOYMENT TO GITHUB & RENDER
 * 
 * This script automates the deployment process:
 * 1. Creates GitHub repository (requires GitHub CLI or manual creation)
 * 2. Pushes code to GitHub
 * 3. Provides Render deployment instructions
 * 4. Configures environment variables
 * 
 * Prerequisites:
 * - Git installed and configured
 * - GitHub account with SSH key or personal access token
 * - GitHub CLI (optional, for automated repo creation)
 * - Render account
 * 
 * Usage:
 *   cd lifeway ka backend
 *   node deploy.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
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
  blue: '\x1b[34m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function logSection(title) {
  log('\n' + '='.repeat(80), 'cyan');
  log(title, 'cyan');
  log('='.repeat(80) + '\n', 'cyan');
}

function question(q) {
  return new Promise(resolve => {
    rl.question(q, resolve);
  });
}

async function runCommand(cmd, description) {
  try {
    log(`\n⏳ ${description}...`, 'yellow');
    const output = execSync(cmd, { encoding: 'utf-8' });
    log(`✅ ${description} completed!\n`, 'green');
    return output;
  } catch (err) {
    log(`❌ ${description} failed!`, 'red');
    log(`Error: ${err.message}\n`, 'red');
    throw err;
  }
}

async function main() {
  logSection('🚀 LIFEWAY BACKEND - DEPLOYMENT AUTOMATION');

  log('This script will guide you through deploying to GitHub and Render.com\n', 'bright');
  log('Prerequisites:');
  log('  ✓ Git installed and configured');
  log('  ✓ GitHub account');
  log('  ✓ Render account');
  log('  ✓ .env file has been configured with Hostinger details\n', 'yellow');

  const continueSetup = await question(colors.yellow + 'Ready to proceed with deployment? (yes/no): ' + colors.reset);
  
  if (continueSetup.toLowerCase() !== 'yes' && continueSetup.toLowerCase() !== 'y') {
    log('\nDeployment cancelled.\n', 'red');
    rl.close();
    return;
  }

  // Step 1: GitHub Setup
  logSection('STEP 1: GitHub Repository Setup');

  const gitHubUsername = await question(colors.bright + 'GitHub Username: ' + colors.reset);
  const testGit = await question(colors.bright + 'Do you want to push to GitHub now? (yes/no): ' + colors.reset);

  if (testGit.toLowerCase() === 'yes' || testGit.toLowerCase() === 'y') {
    try {
      log('\n📝 Configuring Git repository...\n', 'yellow');
      
      // Set branch to main
      await runCommand('git branch -M main', 'Rename branch to main');
      
      // Add remote
      const remoteUrl = `https://github.com/${gitHubUsername}/lifeway-backend.git`;
      try {
        execSync('git remote remove origin', { encoding: 'utf-8' });
      } catch (e) {
        // Remote doesn't exist yet, that's fine
      }
      
      await runCommand(`git remote add origin ${remoteUrl}`, 'Add GitHub remote');
      
      // Push to GitHub
      try {
        await runCommand('git push -u origin main', 'Push code to GitHub');
        log('\n✅ Code successfully pushed to GitHub!\n', 'green');
        log(`GitHub Repository: ${colors.bright}${colors.green}https://github.com/${gitHubUsername}/lifeway-backend\n${colors.reset}`);
      } catch (err) {
        log('\n⚠️  Push to GitHub failed. This might be due to:\n', 'yellow');
        log('  1. SSH key not configured');
        log('  2. Personal access token not set');
        log('  3. Repository doesn\'t exist on GitHub\n');
        log('Manual GitHub setup:', 'bright');
        log(`  1. Go to https://github.com/new`);
        log(`  2. Create repository: lifeway-backend`);
        log(`  3. Then run these commands:\n`);
        log(`     git branch -M main`, 'cyan');
        log(`     git remote add origin https://github.com/${gitHubUsername}/lifeway-backend.git`);
        log(`     git push -u origin main\n`);
      }
    } catch (err) {
      log('\nContinuing with manual GitHub push...\n', 'yellow');
    }
  }

  // Step 2: Environment Configuration
  logSection('STEP 2: Update Node Environment for Production');

  log('Updating .env to NODE_ENV=production for Render deployment...\n', 'yellow');
  
  const envPath = path.join(__dirname, 'backend', '.env');
  let envContent = fs.readFileSync(envPath, 'utf-8');
  envContent = envContent.replace(/NODE_ENV=development/i, 'NODE_ENV=production');
  fs.writeFileSync(envPath, envContent);
  
  log('✅ .env updated to NODE_ENV=production\n', 'green');
  log('⚠️  Important: Do NOT commit .env to GitHub!\n', 'yellow');

  // Step 3: Render Deployment
  logSection('STEP 3: Deploy to Render.com');

  log('Follow these steps to deploy to Render.com:\n', 'bright');
  log('1. Go to: https://dashboard.render.com', 'cyan');
  log('2. Click "New +" → "Web Service"', 'cyan');
  log('3. Click "Connect GitHub" (if not already connected)', 'cyan');
  log('4. Select repository: ' + colors.bright + `${gitHubUsername}/lifeway-backend` + colors.reset + '\n', 'cyan');

  log('5. Configure Web Service:', 'cyan');
  log('   Name:              lifeway-backend', 'cyan');
  log('   Environment:       Node', 'cyan');
  log('   Region:            (Select closest to India)', 'cyan');
  log('   Plan:              Free', 'cyan');
  log('   Build Command:     npm install', 'cyan');
  log('   Start Command:     npm start\n', 'cyan');

  log('6. Add Environment Variables in Render:', 'bright');
  log('   Copy these values from your .env file and paste in Render:\n', 'yellow');

  const envVars = [
    'NODE_ENV=production',
    'PORT=3000',
    'DB_HOST=mysql.hostinger.com',
    'DB_PORT=3306',
    'DB_USER=(from .env)',
    'DB_PASSWORD=(from .env)',
    'DB_NAME=(from .env)',
    'JWT_SECRET=(from .env)',
    'SESSION_SECRET=(from .env)',
    'FRONTEND_URLS=https://lifewaycomputer.org,http://localhost:5000',
    'DB_WAIT_FOR_CONNECTIONS=true',
    'DB_CONNECTION_LIMIT=10',
    'DB_QUEUE_LIMIT=0',
    'DB_ENABLE_KEEP_ALIVE=true',
    'DB_KEEP_ALIVE_INITIAL_DELAY_MS=0'
  ];

  const renderEnvFile = path.join(__dirname, 'RENDER_ENV_VARIABLES_SETUP.txt');
  fs.writeFileSync(renderEnvFile, envVars.join('\n'));
  
  log(colors.cyan + envVars.join('\n') + colors.reset + '\n');
  log(`Variables saved to: ${renderEnvFile}\n`, 'yellow');

  log('7. Click "Create Web Service"', 'bright');
  log('8. Wait 2-3 minutes for deployment', 'bright');
  log('9. Copy your Render URL (format: https://yourapp.onrender.com)\n', 'bright');

  // Step 4: Frontend Update
  logSection('STEP 4: Update Frontend API URL');

  log('After Render deployment completes:\n', 'bright');
  log('1. Get your Render URL from dashboard', 'cyan');
  log('2. Edit: api-service.js', 'cyan');
  log('3. Find this line:', 'cyan');
  log('   const API_BASE_URL = window.location.hostname === \'localhost\' ?...\n', 'yellow');
  log('4. Replace with YOUR Render URL:', 'cyan');
  log(`   const API_BASE_URL = window.location.hostname === 'localhost' ?`, 'yellow');
  log(`     'http://localhost:3000/api' :`, 'yellow');
  log(`     'https://lifeway-backend.onrender.com/api';`, 'yellow');
  log(`   (Change 'lifeway-backend' to YOUR actual Render app name)\n`, 'yellow');

  log('5. Upload updated api-service.js to Hostinger\n', 'cyan');

  // Step 5: Testing
  logSection('STEP 5: Verify Deployment');

  log('After everything is deployed, verify:\n', 'bright');
  log('√ Render dashboard shows "Live" status', 'cyan');
  log('√ Health check works: https://your-app.onrender.com/api/health', 'cyan');
  log('√ Frontend can login successfully', 'cyan');
  log('√ Student data loads from backend', 'cyan');
  log('√ No CORS errors in browser console\n', 'cyan');

  // Summary
  logSection('📋 DEPLOYMENT SUMMARY');

  log('Repository:           ' + `https://github.com/${gitHubUsername}/lifeway-backend`, 'bright');
  log('Environment:          production (on Render)', 'bright');
  log('Database:             mysql.hostinger.com', 'bright');
  log('Frontend Domain:      lifewaycomputer.org', 'bright');
  log('Backend Hosting:      Render.com (Free Tier)', 'bright');
  log('Current Status:       Ready for Render Deployment\n', 'green');

  log('Next Steps:', 'bright');
  log('1. Create GitHub repository at https://github.com/new', 'yellow');
  log('2. Go to https://dashboard.render.com to deploy', 'yellow');
  log('3. Add environment variables to Render dashboard', 'yellow');
  log('4. Update api-service.js with Render URL', 'yellow');
  log('5. Upload updated files to Hostinger\n', 'yellow');

  log('Documentation:', 'bright');
  log('- DEPLOYMENT_GUIDE_INTERACTIVE.md (complete guide)', 'cyan');
  log('- DEPLOYMENT_CHECKLIST.md (verification checklist)', 'cyan');
  log(`- RENDER_ENV_VARIABLES_SETUP.txt (in this directory)\n`, 'cyan');

  log('✨ Your backend is ready for production deployment!\n', 'green');

  rl.close();
}

main().catch(err => {
  log(`\n❌ Error: ${err.message}\n`, 'red');
  process.exit(1);
});
