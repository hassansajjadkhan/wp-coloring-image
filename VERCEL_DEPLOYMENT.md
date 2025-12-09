# Vercel Deployment Guide

## Step 1: Push to GitHub

```bash
cd d:/wp\ client/coloring-automation

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: AI Coloring Page Automation System"

# Add remote
git remote add origin https://github.com/hassansajjadkhan/wp-coloring-image.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Set Up Vercel Project

1. **Go to Vercel**: https://vercel.com
2. **Sign in with GitHub** (or create account)
3. **Import Project**:
   - Click "Add New..." → "Project"
   - Select the `wp-coloring-image` repository
   - Click "Import"

4. **Configure Build Settings**:
   - Framework: "Other" (it's a monorepo)
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build` (or leave blank for auto-detection)
   - Output Directory: (leave blank)

## Step 3: Set Environment Variables

In Vercel Project Settings → Environment Variables, add:

```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxx
WORDPRESS_URL=https://www.kleurplatenparadijs.nl
WORDPRESS_USERNAME=its.haroon100@gmail.com
WORDPRESS_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
WORDPRESS_CATEGORY_ID=20
MOCK_MODE=false
NODE_ENV=production
PORT=5000
```

## Step 4: Deploy

Click "Deploy" button in Vercel. The deployment will:
1. Build the server (TypeScript compilation)
2. Build the client (Vite build)
3. Deploy both to serverless functions

## Important Notes

### Database Persistence
⚠️ **Important**: SQLite database won't persist on Vercel because serverless functions have ephemeral storage.

**Options**:
1. **Use MongoDB Atlas** (recommended) - Free tier available
2. **Use Prisma** with PostgreSQL
3. **Use Supabase** - PostgreSQL + real-time

### File Storage
⚠️ The `/data/images/` directory won't persist.

**Solutions**:
1. **AWS S3** - Store images in cloud bucket
2. **Cloudinary** - Image hosting service
3. **Vercel Blob Storage** - New Vercel feature

### Large Files
- `better-sqlite3` may need build configuration
- Consider switching to a cloud database

## Local Testing Before Deploy

```bash
# Build both projects
cd server && npm run build && cd ..
cd client && npm run build && cd ..

# Test with Vercel CLI
npm i -g vercel
vercel dev
```

## Troubleshooting

### Module Not Found
- Check all imports use relative paths correctly
- Ensure `type: "module"` in package.json

### Environment Variables Not Loading
- Verify variables are set in Vercel dashboard
- Restart deployment after adding variables

### Port Issues
- Vercel assigns PORT automatically
- Don't hardcode port in code

### Database/Files Lost
- This is expected on serverless
- Implement cloud storage solution

## Next Steps

After successful deployment:

1. Test the API endpoints
2. Upload a test coloring page to WordPress
3. Set up cloud database (if using database)
4. Set up image storage (if needed)
5. Configure custom domain (optional)

## Support

For issues:
- Check Vercel logs: Dashboard → Function Logs
- GitHub Issues: https://github.com/hassansajjadkhan/wp-coloring-image/issues
- Vercel Docs: https://vercel.com/docs
