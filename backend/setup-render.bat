@echo off
REM ============================================================================
REM Lifeway Computers - Render Deployment Setup Script (Windows)
REM ============================================================================
REM This script automates setup for Render.com deployment on Windows
REM 
REM Usage: setup-render.bat
REM ============================================================================

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║   Lifeway Computers - Render Deployment Setup Script (Windows) ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if we're in the backend directory
if not exist "package.json" (
    echo ❌ Error: package.json not found!
    echo    Please run this script from the 'backend' directory
    echo    Example: cd backend ^&^& setup-render.bat
    pause
    exit /b 1
)

REM ============================================================================
REM Step 1: Dependencies
REM ============================================================================
echo 📥 Step 1: Installing Node.js dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install dependencies
    echo    Make sure Node.js is installed: https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully
echo.

REM ============================================================================
REM Step 2: Environment Configuration
REM ============================================================================
echo ⚙️  Step 2: Setting up environment configuration...

if exist ".env" (
    echo    .env file already exists
    set /p reconfigure="   Reconfigure it? (y/n) "
    if /i "!reconfigure!"=="y" (
        del .env
        copy .env.example .env >nul
        echo    ✓ .env file recreated from template
    ) else (
        echo    Skipping .env configuration...
    )
) else (
    echo    Creating .env file from template...
    copy .env.example .env >nul
    echo    ✓ .env file created
)

echo    📝 Next, edit .env with your Hostinger MySQL details:
echo       Start notepad .env
echo.

REM ============================================================================
REM Step 3: Verify Setup
REM ============================================================================
echo 🔍 Step 3: Verifying setup...

set "ALL_EXIST=true"

for %%F in (package.json server.js Procfile runtime.txt .env.example .env) do (
    if exist "%%F" (
        echo    ✓ %%F
    ) else (
        echo    ❌ %%F (missing!)
        set "ALL_EXIST=false"
    )
)

for %%D in (config routes middleware controllers models) do (
    if exist "%%D\" (
        echo    ✓ %%D/ directory
    ) else (
        echo    ⚠️  %%D/ directory (missing)
    )
)

echo.

if "!ALL_EXIST!"=="false" (
    echo ❌ Some required files are missing!
    echo    Please ensure backend structure is complete
    pause
    exit /b 1
)

echo ✓ All required files present
echo.

REM ============================================================================
REM Step 4: Generate Secrets (Optional)
REM ============================================================================
echo 🔐 Step 4: Generating secure secrets (optional)...
echo.
echo    If you need to generate secure secrets for .env:
echo.
echo    # JWT_SECRET (run in PowerShell):
echo    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
echo.
echo    # SESSION_SECRET (same command):
echo    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
echo.

REM ============================================================================
REM Step 5: Local Testing
REM ============================================================================
echo 🧪 Step 5: Ready to test locally...
echo.
echo    To test your backend locally:
echo    1. Edit .env with your Hostinger MySQL credentials
echo    2. Run: npm start
echo    3. Check if: "✓ MySQL Database connected successfully"
echo    4. Test health: curl http://localhost:3000/api/health
echo.

REM ============================================================================
REM Step 6: Deployment Instructions
REM ============================================================================
echo ☁️  Step 6: Ready to deploy to Render!
echo.
echo    Next steps:
echo    1. Ensure code is committed to GitHub
echo    2. Go to https://render.com/dashboard
echo    3. Create new Web Service
echo    4. Connect your GitHub repository
echo    5. Add environment variables from .env
echo    6. Deploy!
echo.

REM ============================================================================
REM Summary
REM ============================================================================
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    SETUP COMPLETE! ✓                          ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 📋 Checklist before deployment:
echo    ☐ Edit .env with your Hostinger MySQL details
echo    ☐ Test locally: npm start
echo    ☐ Verify database connection test output
echo    ☐ Push code to GitHub
echo    ☐ Create Render.com account
echo    ☐ Connect GitHub repository to Render
echo    ☐ Add environment variables to Render
echo    ☐ Deploy to Render
echo    ☐ Update api-service.js with Render URL
echo    ☐ Test from your Hostinger frontend
echo.
echo 📚 Documentation:
echo    - RENDER_DEPLOYMENT.md - Complete deployment guide
echo    - HOSTINGER_RENDER_INTEGRATION.md - Quick integration guide
echo    - API_TESTING_GUIDE.md - How to test APIs
echo.
echo 🚀 Let's get started!
echo.

pause
