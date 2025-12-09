# COMMAND REFERENCE

## Quick Navigation

```powershell
# Go to project
cd "d:\wp client\coloring-automation"

# Go to server
cd server

# Go to client
cd client

# Go back
cd ..
```

## Setup & Installation

```powershell
# Windows - Automatic setup
setup.bat

# macOS/Linux - Automatic setup
bash setup.sh

# Manual backend setup
cd server
npm install

# Manual frontend setup
cd client
npm install
```

## Development

```powershell
# Start backend (development)
cd server
npm run dev

# Start frontend (development)
cd client
npm run dev

# Both together (2 terminals):
# Terminal 1: cd server && npm run dev
# Terminal 2: cd client && npm run dev
```

## Production Build

```powershell
# Backend build
cd server
npm run build
npm run start

# Frontend build
cd client
npm run build
npm run preview
```

## Database Management

```powershell
# View database
sqlite3 data\coloring.db

# Backup database
Copy-Item data\coloring.db data\coloring.db.backup

# Reset database (delete and restart)
Remove-Item data\coloring.db
npm run dev  # Restarts and recreates
```

## Vercel Deployment

```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy backend
cd server
npm run build
vercel deploy

# Deploy frontend
cd client
npm run build
vercel deploy

# Set environment variables
vercel env add OPENAI_API_KEY
vercel env add WORDPRESS_URL
# ... etc
```

## Testing

```powershell
# Test backend health
Invoke-WebRequest http://localhost:3001/api/health

# Test OpenAI connection
$body = @{
    quantity = 5
    style = "cute"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3001/api/ai/generate-ideas `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Test WordPress connection
# (Requires backend running)
```

## Logs & Debugging

```powershell
# Backend logs (shown in terminal where npm run dev started)
# Frontend logs (shown in browser console)
# Check browser console: F12 or Ctrl+Shift+I

# View detailed logs
# Backend: Check terminal output
# Frontend: Browser DevTools → Console

# Clear cache
Remove-Item -Path node_modules -Recurse
npm install
```

## Environment Variables

```powershell
# Create .env file
New-Item -Path server\.env -Type File

# Edit .env
notepad server\.env

# Template:
PORT=3001
OPENAI_API_KEY=sk-proj-xxxxx
WORDPRESS_URL=https://example.com
WORDPRESS_USERNAME=user
WORDPRESS_PASSWORD=pass
DB_PATH=./data/coloring.db
DAILY_LIMIT=50
DEFAULT_PUBLISH_HOUR=8
NODE_ENV=production
```

## File Operations

```powershell
# Create directories
mkdir data
mkdir public/pdfs

# View project structure
tree /F

# Count files
Get-ChildItem -Recurse -File | Measure-Object

# Find specific file
Get-ChildItem -Recurse -Filter "*.tsx"

# Search in files
Select-String -Path "*.ts" -Pattern "function"
```

## Git Commands

```powershell
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/user/repo.git
git push -u origin main
```

## API Endpoints (Test)

```powershell
# Generate ideas
$body = @{
    quantity = 5
    style = "cute"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3001/api/ai/generate-ideas `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Create prompt
$body = @{
    title = "Christmas"
    quantity = 10
    style = "cute"
    category = "Christmas"
    ideas = @("Snowman", "Santa", "Christmas Tree")
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3001/api/ai/create-prompt `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Get scheduler settings
Invoke-WebRequest -Uri http://localhost:3001/api/scheduler/settings

# Update scheduler settings
$body = @{
    dailyLimit = 10
    publishHour = 8
    publishMinute = 0
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3001/api/scheduler/settings `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

## NPM Package Management

```powershell
# Install specific package
npm install package-name

# Install dev dependency
npm install --save-dev package-name

# Update package
npm update package-name

# Remove package
npm uninstall package-name

# List installed packages
npm list

# Check for outdated packages
npm outdated
```

## Troubleshooting Commands

```powershell
# Check Node.js version
node -v

# Check npm version
npm -v

# Clear npm cache
npm cache clean --force

# Check disk space
Get-Volume

# Kill process on port 3001
Get-NetTCPConnection -LocalPort 3001
# Then: Stop-Process -Id [PID]

# Kill process on port 3000
Get-NetTCPConnection -LocalPort 3000
# Then: Stop-Process -Id [PID]

# Check if ports are available
netstat -ano | findstr :3001
netstat -ano | findstr :3000
```

## Windows Terminal Tips

```powershell
# Open new tab
Ctrl + Shift + T

# Open new window
Ctrl + Shift + N

# Split pane (vertical)
Alt + Shift + D

# Split pane (horizontal)
Alt + Shift + -

# Go to previous directory
cd -

# List directory
ls
dir
Get-ChildItem

# Clear screen
Clear-Host
cls
```

## VSCode Shortcuts

```
Ctrl + ` = Open terminal
Ctrl + Shift + ` = New terminal
Ctrl + J = Toggle panel
Ctrl + K + C = Comment code
Ctrl + K + U = Uncomment code
Ctrl + F = Find
Ctrl + H = Find & Replace
F5 = Start debugging
Shift + F5 = Stop debugging
```

## Common Issues & Fixes

```powershell
# Port already in use
# Change port in server\src\index.ts
# Or kill existing process
Stop-Process -Name node

# Module not found
npm install
npm install --legacy-peer-deps

# Permission denied
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# CORS errors
# Verify backend is running
# Check proxy in client\vite.config.ts

# TypeScript errors
npx tsc --noEmit

# Clear build cache
Remove-Item -Path dist -Recurse
Remove-Item -Path .next -Recurse
npm run build
```

## Useful Scripts (add to package.json)

```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "echo \"Error: no test specified\" && exit 1",
    "clean": "rm -rf dist node_modules",
    "reinstall": "npm run clean && npm install"
  }
}
```

## Backup & Restore

```powershell
# Backup entire project
$date = Get-Date -Format "yyyy-MM-dd_HHmmss"
Copy-Item -Path "coloring-automation" -Destination "coloring-automation_$date" -Recurse

# Backup database only
Copy-Item -Path "data\coloring.db" -Destination "data\coloring.db.$date"

# Restore from backup
Copy-Item -Path "data\coloring.db.backup" -Destination "data\coloring.db" -Force
```

## Performance Tips

```powershell
# Monitor memory usage
Get-Process node | Select-Object Name, WorkingSet

# Monitor CPU usage
Get-Process node | Select-Object Name, CPU

# Check disk usage
Get-ChildItem -Path "." -Recurse | Measure-Object -Property Length -Sum

# Optimize dependencies
npm dedupe
npm prune
```

## Documentation & Help

```powershell
# View README
type README.md
more README.md

# View specific guide
type IMPLEMENTATION_GUIDE.md
type DEPLOYMENT.md

# Generate documentation
# (if available in project)
npm run docs
```

## Useful URLs

```
Local Frontend:      http://localhost:3000
Local Backend:       http://localhost:3001
Backend Health:      http://localhost:3001/api/health
WordPress Admin:     https://www.kleurplatenparadijs.nl/wp-admin
OpenAI Dashboard:    https://platform.openai.com/account
Vercel Dashboard:    https://vercel.com/dashboard
GitHub:              https://github.com
```

## Remember

- Keep `.env` files private (never commit)
- Always use `npm install` before starting
- Run backend and frontend in separate terminals
- Check browser console for frontend errors
- Check terminal for backend errors
- Restart servers after changing code
- Keep API keys secure
- Test locally before deploying
- Monitor logs during development

---

**For more info, see:**
- README.md
- QUICKSTART.md
- IMPLEMENTATION_GUIDE.md
- DEPLOYMENT.md
