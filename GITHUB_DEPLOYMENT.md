# Quick GitHub & Vercel Deployment

## 1. Push Code to GitHub

Open PowerShell in the project folder and run:

```powershell
# Navigate to project
cd "d:\wp client\coloring-automation"

# Initialize git (only if not already a git repo)
git init

# Configure git
git config user.name "Your Name"
git config user.email "your.email@gmail.com"

# Add all files
git add .

# Commit
git commit -m "Initial commit: AI Coloring Page Automation System"

# Add GitHub remote
git remote add origin https://github.com/hassansajjadkhan/wp-coloring-image.git

# Push to GitHub (creates main branch)
git branch -M main
git push -u origin main
```

## 2. Verify on GitHub

1. Go to: https://github.com/hassansajjadkhan/wp-coloring-image
2. Verify all files are uploaded
3. Check that `.env` is in `.gitignore` (it shouldn't be in the repo)

## 3. Deploy to Vercel

### Option A: Via Web Dashboard
1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Select GitHub repository: `wp-coloring-image`
4. Click "Import"
5. Set environment variables (see below)
6. Click "Deploy"

### Option B: Via Vercel CLI
```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy from project directory
vercel

# Follow prompts:
# - Link to account
# - Select repository
# - Set environment variables
# - Deploy
```

## 4. Set Environment Variables in Vercel

In Vercel Dashboard → Project Settings → Environment Variables:

```
OPENAI_API_KEY = sk-proj-xxxxxxxxxxxx
WORDPRESS_URL = https://www.kleurplatenparadijs.nl
WORDPRESS_USERNAME = its.haroon100@gmail.com
WORDPRESS_PASSWORD = xxxx xxxx xxxx xxxx xxxx xxxx
WORDPRESS_CATEGORY_ID = 20
MOCK_MODE = false
NODE_ENV = production
```

## 5. Check Deployment Status

- Vercel Dashboard shows build progress
- Once complete, your app is live at: `https://your-project.vercel.app`
- API available at: `https://your-project.vercel.app/api/...`
- Frontend available at: `https://your-project.vercel.app`

## 6. Test the Deployment

Visit in browser:
- Frontend: `https://your-project.vercel.app`
- API Test: `https://your-project.vercel.app/api/wordpress/test-connection`

## Common Issues

### "Permission denied" in git
```powershell
# Use HTTPS instead (or set up SSH)
git remote remove origin
git remote add origin https://github.com/hassansajjadkhan/wp-coloring-image.git
```

### Build fails on Vercel
- Check Vercel Function Logs
- Verify all environment variables are set
- Check that `npm run build` works locally first

### Environment variables not loading
- Wait 5 minutes after setting them
- Redeploy: Deployments → Select latest → Redeploy

## What Happens on Vercel

✅ **Server** deployed as serverless functions
✅ **Client** deployed as static site
✅ **Auto-builds** on every GitHub push
✅ **Auto-deploys** when build succeeds

## Next: Production Considerations

⚠️ **Database**: SQLite won't persist. Consider:
- MongoDB Atlas
- PostgreSQL + Supabase
- Firebase Firestore

⚠️ **Images**: `/data/images` won't persist. Consider:
- AWS S3
- Cloudinary
- Vercel Blob

For more details, see: VERCEL_DEPLOYMENT.md
