# DEPLOYMENT GUIDE

## Overview

Your AI Coloring Page Automation System can be deployed to Vercel for free, making it accessible from anywhere.

## Pre-Deployment Checklist

- [ ] All environment variables configured locally
- [ ] OpenAI API key is valid & has quota
- [ ] WordPress app password created
- [ ] Dependencies installed (`npm install` in both folders)
- [ ] Local testing completed

## Vercel Deployment (Recommended)

### 1. Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub/Google
3. Connect your GitHub repository

### 2. Deploy Backend

```bash
cd server
npm run build
vercel deploy
```

During deployment, set environment variables:
- `OPENAI_API_KEY`
- `WORDPRESS_URL`
- `WORDPRESS_USERNAME`
- `WORDPRESS_PASSWORD`
- `DAILY_LIMIT` (default: 50)
- `DEFAULT_PUBLISH_HOUR` (default: 8)
- `NODE_ENV=production`

Note the deployed URL (e.g., `coloring-api.vercel.app`)

### 3. Deploy Frontend

Update `client/vite.config.ts` with backend URL:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'https://coloring-api.vercel.app',
      changeOrigin: true,
    },
  },
},
```

```bash
cd client
npm run build
vercel deploy
```

### 4. Verify Deployment

1. Open frontend URL (e.g., `https://coloring-client.vercel.app`)
2. Try creating a prompt
3. Check scheduler settings
4. Monitor API logs on Vercel dashboard

## Alternative: Railway.app

### 1. Create Account
Go to https://railway.app and sign up

### 2. Connect GitHub
1. New project → GitHub
2. Select your repository

### 3. Configure
Add environment variables in Railway dashboard

### 4. Deploy
Push to main branch - Railway auto-deploys

## Alternative: Self-Hosted (AWS/DigitalOcean)

### Docker Setup

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/ .
RUN npm install
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3001
CMD ["npm", "run", "start"]
```

### Deploy with Docker Compose

```yaml
version: '3'
services:
  api:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - WORDPRESS_URL=${WORDPRESS_URL}
      # ... other env vars
  
  client:
    build: ./client
    ports:
      - "3000:3000"
```

## GitHub Actions CI/CD

See `.github/workflows/deploy.yml` for automatic deployment on push to main.

### Setup:
1. Add secrets in GitHub repository settings:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID_SERVER`
   - `VERCEL_PROJECT_ID_CLIENT`

2. Push to main branch - automatic deployment starts

## Environment Variables

### Required for Production
```
OPENAI_API_KEY=sk-proj-xxxxx
WORDPRESS_URL=https://www.kleurplatenparadijs.nl
WORDPRESS_USERNAME=its.haroon100@gmail.com
WORDPRESS_PASSWORD=29k5 XTns BKH5 pUua v4lL oMgC
```

### Optional
```
PORT=3001
DB_PATH=/tmp/coloring.db  # Use /tmp for serverless
DAILY_LIMIT=50
DEFAULT_PUBLISH_HOUR=8
NODE_ENV=production
```

## Monitoring

### Vercel Dashboard
- View logs
- Monitor performance
- Check error rates

### Manual Testing
```bash
# Test health endpoint
curl https://your-api.vercel.app/api/health

# Test OpenAI connection
curl -X POST https://your-api.vercel.app/api/ai/generate-ideas \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5, "style": "cute"}'
```

## Troubleshooting

### API Key Issues
```
Error: 401 Unauthorized
```
- Check OPENAI_API_KEY is set in Vercel
- Verify key hasn't been revoked
- Ensure API key has GPT-4 & DALL-E 3 access

### WordPress Connection
```
Error: Cannot connect to WordPress
```
- Verify WORDPRESS_URL is correct
- Check application password is valid
- Ensure REST API is enabled on WordPress

### Database Issues
```
Error: Cannot write to database
```
- Vercel doesn't persist files
- Use external database (MongoDB, Supabase)
- Or modify code to use temporary storage

### Scheduler Not Running
```
Scheduled jobs not executing
```
- Serverless functions have timeout limits
- Use external scheduler service (AWS Lambda, Cron.io)
- Or keep a dyno running on Railway/Heroku

## Cost Estimation

### Monthly Costs
- **Vercel**: Free tier (up to 100GB bandwidth)
- **OpenAI**: ~$0.04/image × 1500 images = $60
- **WordPress**: Your existing hosting
- **Database**: Free (included)
- **Total**: ~$60/month (OpenAI costs only)

### Ways to Reduce Costs
- Reduce daily limits (1-10 posts/day)
- Use simpler image generation
- Cache similar ideas
- Schedule batch generation

## Backup & Recovery

### Backup Database
```bash
# Download SQLite database
vercel env pull
sqlite3 coloring.db ".dump" > backup.sql
```

### Restore Database
```bash
sqlite3 coloring.db < backup.sql
```

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Configure environment variables
3. ✅ Test all features
4. ✅ Set up daily scheduler
5. ✅ Monitor logs regularly
6. ✅ Keep API key secure

---

For questions or issues, check README.md or contact support.
