#!/bin/bash

# Lifeway Computers - Quick Setup Script
# This script helps you get started quickly

echo "🚀 Lifeway Computers - Quick Setup"
echo "================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher"
    exit 1
fi

echo "✓ Node.js is installed: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✓ npm is installed: $(npm --version)"
echo ""

# Setup backend
echo "📦 Setting up backend..."
cd backend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in backend directory"
    exit 1
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
else
    echo "✓ Dependencies already installed"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your MySQL credentials"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your MySQL credentials"
echo "2. Start the backend: npm run dev"
echo "3. Open index.html in your browser"
echo "4. Visit http://localhost:5000/api/health to verify backend"
echo ""
echo "📚 For more information, see README.md"
