@echo off
REM AI Coloring Page Automation System - Setup Script for Windows

echo.
echo 🎨 Setting up AI Coloring Page Automation System
echo ==================================================

REM Check Node.js
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org
    exit /b 1
)

echo ✅ Node.js found: & node -v

REM Create data directory
if not exist "data" mkdir data

REM Install backend dependencies
echo.
echo 📦 Installing backend dependencies...
cd server
call npm install
if errorlevel 1 (
    echo ❌ Backend installation failed
    exit /b 1
)
echo ✅ Backend dependencies installed

REM Install frontend dependencies
echo.
echo 📦 Installing frontend dependencies...
cd ..\client
call npm install
if errorlevel 1 (
    echo ❌ Frontend installation failed
    exit /b 1
)
echo ✅ Frontend dependencies installed

REM Check for .env file
echo.
if not exist "..\server\.env" (
    echo ⚠️  No .env file found in server/
    echo 📋 Creating .env from .env.example...
    copy "..\server\.env.example" "..\server\.env"
    echo ⚠️  Please edit server/.env with your configuration
)

echo.
echo ==================================================
echo ✅ Setup complete!
echo.
echo 📝 Next steps:
echo 1. Edit server/.env with your credentials
echo 2. Run: npm run dev (in server/)
echo 3. Run: npm run dev (in client/)
echo 4. Open: http://localhost:3000
echo.
echo 📚 For more info, see README.md
echo ==================================================
