#!/bin/bash

# AI Coloring Page Automation System - Setup Script

echo "🎨 Setting up AI Coloring Page Automation System"
echo "=================================================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js found: $(node -v)"

# Create data directory
mkdir -p data

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd server
npm install

if [ $? -ne 0 ]; then
    echo "❌ Backend installation failed"
    exit 1
fi

echo "✅ Backend dependencies installed"

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd ../client
npm install

if [ $? -ne 0 ]; then
    echo "❌ Frontend installation failed"
    exit 1
fi

echo "✅ Frontend dependencies installed"

# Check for .env file
echo ""
if [ ! -f "../server/.env" ]; then
    echo "⚠️  No .env file found in server/"
    echo "📋 Creating .env from .env.example..."
    cp server/.env.example server/.env
    echo "⚠️  Please edit server/.env with your configuration"
fi

echo ""
echo "=================================================="
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit server/.env with your credentials"
echo "2. Run: npm run dev (in server/)"
echo "3. Run: npm run dev (in client/)"
echo "4. Open: http://localhost:3000"
echo ""
echo "📚 For more info, see README.md"
echo "=================================================="
