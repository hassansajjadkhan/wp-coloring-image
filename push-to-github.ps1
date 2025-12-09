#!/usr/bin/env pwsh

# Colors for output
$green = [System.ConsoleColor]::Green
$red = [System.ConsoleColor]::Red
$yellow = [System.ConsoleColor]::Yellow
$cyan = [System.ConsoleColor]::Cyan

Write-Host "🚀 GitHub Push Script" -ForegroundColor $cyan
Write-Host "=====================" -ForegroundColor $cyan
Write-Host ""

# Check if git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed!" -ForegroundColor $red
    exit 1
}

# Navigate to project directory
$projectPath = "d:\wp client\coloring-automation"
if (-not (Test-Path $projectPath)) {
    Write-Host "❌ Project path not found: $projectPath" -ForegroundColor $red
    exit 1
}

Set-Location $projectPath
Write-Host "✅ Working directory: $(Get-Location)" -ForegroundColor $green
Write-Host ""

# Check if git repo exists
if (-not (Test-Path ".git")) {
    Write-Host "📝 Initializing git repository..." -ForegroundColor $yellow
    git init
    
    Write-Host "🔧 Configuring git user..." -ForegroundColor $yellow
    git config user.name "Hassan Sajjad Khan"
    git config user.email "your.email@gmail.com"
}

# Add all files
Write-Host "📦 Adding all files..." -ForegroundColor $yellow
git add .

# Check for changes
$status = git status --porcelain
if (-not $status) {
    Write-Host "⚠️  No changes to commit" -ForegroundColor $yellow
} else {
    # Commit
    Write-Host "💾 Creating commit..." -ForegroundColor $yellow
    git commit -m "feat: AI Coloring Page Automation System with WordPress integration"
    
    # Check if remote exists
    $remoteExists = git remote | Select-String "origin"
    
    if (-not $remoteExists) {
        Write-Host "🔗 Adding GitHub remote..." -ForegroundColor $yellow
        git remote add origin "https://github.com/hassansajjadkhan/wp-coloring-image.git"
    }
    
    # Rename branch to main if needed
    $currentBranch = git rev-parse --abbrev-ref HEAD
    if ($currentBranch -ne "main") {
        Write-Host "🔀 Renaming branch to main..." -ForegroundColor $yellow
        git branch -M main
    }
    
    # Push to GitHub
    Write-Host "🚀 Pushing to GitHub..." -ForegroundColor $yellow
    git push -u origin main
}

Write-Host ""
Write-Host "✅ GitHub push complete!" -ForegroundColor $green
Write-Host ""
Write-Host "📍 Repository: https://github.com/hassansajjadkhan/wp-coloring-image" -ForegroundColor $cyan
Write-Host ""
Write-Host "Next: Deploy to Vercel" -ForegroundColor $yellow
Write-Host "  1. Go to: https://vercel.com" -ForegroundColor $yellow
Write-Host "  2. Click 'Add New...' -> 'Project'" -ForegroundColor $yellow
Write-Host "  3. Select 'wp-coloring-image' repository" -ForegroundColor $yellow
Write-Host "  4. Set environment variables" -ForegroundColor $yellow
Write-Host "  5. Click 'Deploy'" -ForegroundColor $yellow
