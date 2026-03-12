#!/bin/bash

# ============================================================================
# Lifeway Computers - Render Deployment Setup Script
# ============================================================================
# This script automates setup for Render.com deployment
# 
# Usage: bash setup-render.sh
# ============================================================================

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     Lifeway Computers - Render Deployment Setup Script       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "   Please run this script from the 'backend' directory"
    echo "   cd backend && bash setup-render.sh"
    exit 1
fi

echo "📦 Setting up for Render deployment..."
echo ""

# ============================================================================
# Step 1: Dependencies
# ============================================================================
echo "📥 Step 1: Installing Node.js dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    echo "   Make sure Node.js is installed: https://nodejs.org"
    exit 1
fi
echo ""

# ============================================================================
# Step 2: Environment Configuration
# ============================================================================
echo "⚙️  Step 2: Setting up environment configuration..."

if [ -f ".env" ]; then
    echo "   .env file already exists"
    read -p "   Do you want to reconfigure it? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "   Skipping .env configuration..."
    else
        rm .env
        cp .env.example .env
        echo "   ✓ .env file recreated from template"
    fi
else
    echo "   Creating .env file from template..."
    cp .env.example .env
    echo "   ✓ .env file created"
fi

echo "   📝 Next, edit .env with your Hostinger MySQL details:"
echo "      nano .env  (or use your favorite editor)"
echo ""

# ============================================================================
# Step 3: Verify Setup
# ============================================================================
echo "🔍 Step 3: Verifying setup..."

# Check for required files
FILES=("package.json" "server.js" "Procfile" "runtime.txt" ".env.example" ".env")
ALL_EXIST=true

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✓ $file"
    else
        echo "   ❌ $file (missing!)"
        ALL_EXIST=false
    fi
done

if [ ! -d "config" ]; then
    echo "   ❌ config/ directory (missing!)"
    ALL_EXIST=false
else
    echo "   ✓ config/ directory"
fi

if [ ! -d "routes" ]; then
    echo "   ❌ routes/ directory (missing!)"
    ALL_EXIST=false
else
    echo "   ✓ routes/ directory"
fi

echo ""

if [ "$ALL_EXIST" = false ]; then
    echo "❌ Some required files are missing!"
    echo "   Please ensure backend structure is complete"
    exit 1
fi

echo "✓ All required files present"
echo ""

# ============================================================================
# Step 4: Generate Secrets (Optional)
# ============================================================================
echo "🔐 Step 4: Generating secure secrets (optional)..."
echo ""
echo "   If you need to generate secure secrets for .env:"
echo ""
echo "   # JWT_SECRET:"
echo "   node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
echo ""
echo "   # SESSION_SECRET:"
echo "   node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
echo ""

# ============================================================================
# Step 5: Local Testing
# ============================================================================
echo "🧪 Step 5: Ready to test locally..."
echo ""
echo "   To test your backend locally:"
echo "   1. Edit .env with your Hostinger MySQL credentials"
echo "   2. Run: npm start"
echo "   3. Check if: ✓ MySQL Database connected successfully"
echo "   4. Test health: curl http://localhost:3000/api/health"
echo ""

# ============================================================================
# Step 6: Deployment Instructions
# ============================================================================
echo "☁️  Step 6: Ready to deploy to Render!"
echo ""
echo "   Next steps:"
echo "   1. Ensure code is committed to GitHub"
echo "   2. Go to https://render.com/dashboard"
echo "   3. Create new Web Service"
echo "   4. Connect your GitHub repository"
echo "   5. Add environment variables from .env"
echo "   6. Deploy!"
echo ""

# ============================================================================
# Summary
# ============================================================================
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    SETUP COMPLETE! ✓                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Checklist before deployment:"
echo "   ☐ Edit .env with your Hostinger MySQL details"
echo "   ☐ Test locally: npm start"
echo "   ☐ Verify database connection test output"
echo "   ☐ Push code to GitHub"
echo "   ☐ Create Render.com account"
echo "   ☐ Connect GitHub repository to Render"
echo "   ☐ Add environment variables to Render"
echo "   ☐ Deploy to Render"
echo "   ☐ Update api-service.js with Render URL"
echo "   ☐ Test from your Hostinger frontend"
echo ""
echo "📚 Documentation:"
echo "   - RENDER_DEPLOYMENT.md - Complete deployment guide"
echo "   - HOSTINGER_RENDER_INTEGRATION.md - Quick integration guide"
echo "   - API_TESTING_GUIDE.md - How to test APIs"
echo ""
echo "🚀 Let's get started!"
echo ""
