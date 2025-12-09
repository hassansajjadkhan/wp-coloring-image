# 🚀 Deployment Checklist

Follow these steps to deploy to GitHub and Vercel:

## Step 1: Prepare Local Code ✅

- [ ] Verify `.env` file is NOT in git repo (check `.gitignore`)
- [ ] Ensure `npm run build` works for both server and client
- [ ] Test locally with `npm run dev`
- [ ] Check that no sensitive data is in code

## Step 2: Push to GitHub

### 2a. Initialize Git (if needed)
```powershell
cd "d:\wp client\coloring-automation"
git init
git config user.name "Your Name"
git config user.email "your.email@gmail.com"
```

### 2b. Commit and Push
```powershell
git add .
git commit -m "Initial commit: AI Coloring Page Automation System"
git remote add origin https://github.com/hassansajjadkhan/wp-coloring-image.git
git branch -M main
git push -u origin main
```

### 2c. Verify
- [ ] Visit GitHub repo: https://github.com/hassansajjadkhan/wp-coloring-image
- [ ] Verify all files are uploaded
- [ ] Check `.env` is NOT in the repo

## Step 3: Deploy to Vercel

### 3a. Create Vercel Account
- [ ] Visit https://vercel.com
- [ ] Sign up with GitHub

### 3b. Import Project
- [ ] Click "Add New..." → "Project"
- [ ] Select `wp-coloring-image` repository
- [ ] Click "Import"

### 3c. Set Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `OPENAI_API_KEY` | sk-proj-... (your OpenAI key) |
| `WORDPRESS_URL` | https://www.kleurplatenparadijs.nl |
| `WORDPRESS_USERNAME` | its.haroon100@gmail.com |
| `WORDPRESS_PASSWORD` | (your app password) |
| `WORDPRESS_CATEGORY_ID` | 20 |
| `MOCK_MODE` | false |
| `NODE_ENV` | production |

### 3d. Deploy
- [ ] Click "Deploy" button
- [ ] Wait for build to complete (5-10 minutes)
- [ ] Check deployment status

## Step 4: Test Deployment

Once live, test:

- [ ] Visit frontend: `https://your-project-name.vercel.app`
- [ ] Test API: `https://your-project-name.vercel.app/api/wordpress/test-connection`
- [ ] Try generating a coloring page
- [ ] Test uploading to WordPress

## Step 5: Post-Deployment

### 5a. Set Custom Domain (Optional)
- [ ] In Vercel → Settings → Domains
- [ ] Add custom domain
- [ ] Update DNS records

### 5b. Monitor Performance
- [ ] Check Vercel Analytics
- [ ] Monitor function logs
- [ ] Set up error notifications

### 5c. Production Considerations
- [ ] Database persistence (implement cloud DB)
- [ ] Image storage (implement cloud storage)
- [ ] Error handling and logging
- [ ] Rate limiting for API

## Important Notes

⚠️ **SQLite Database**
- Won't persist between deployments
- Plan to migrate to cloud database
- Options: MongoDB, PostgreSQL, Firebase

⚠️ **Image Storage**
- `/data/images` is ephemeral
- Plan to use cloud storage
- Options: S3, Cloudinary, Vercel Blob

⚠️ **Environment Variables**
- Never commit `.env` file
- Always set in Vercel dashboard
- Can take 5 minutes to apply

## Troubleshooting

### Build Fails
1. Check Vercel Function Logs
2. Run `npm run build` locally
3. Verify all dependencies are listed in package.json

### Variables Not Working
1. Verify in Vercel dashboard
2. Wait 5 minutes after adding
3. Redeploy the project

### API Returns 500 Error
1. Check Function Logs in Vercel
2. Verify WordPress credentials
3. Verify OpenAI API key is valid

### Database Error
1. This is expected (SQLite doesn't persist)
2. Implement cloud database solution
3. See VERCEL_DEPLOYMENT.md for options

## Support Links

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- GitHub Issues: https://github.com/hassansajjadkhan/wp-coloring-image/issues

## Done! 🎉

Your AI Coloring Page Automation System is now live on Vercel!

Next steps:
- Share the URL: `https://your-project-name.vercel.app`
- Monitor performance
- Plan production database/storage
- Implement monitoring and alerts
