# AI Coloring Page Automation System 🎨

Complete automated system for generating, reviewing, and publishing AI-generated coloring pages to WordPress.

## Features ✨

- 🤖 AI-powered coloring page generation using OpenAI
- 📋 Automatic unique idea generation
- 📊 Visual review & approval dashboard
- ✏️ Auto-fill SEO metadata
- 🔗 Direct WordPress integration via REST API
- ⏰ Daily automatic scheduler
- 📥 PDF generation & download buttons
- 🎯 Category management

## Project Structure

```
coloring-automation/
├── server/          # Node.js/Express backend
│   ├── src/
│   │   ├── api/           # REST API routes
│   │   ├── services/      # Business logic
│   │   └── db/            # Database
│   └── package.json
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/    # React components
│   │   └── pages/         # Page components
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key (GPT-4 & DALL-E 3 access)
- WordPress site with REST API enabled

### 1. Configure Environment

Create `.env` file in the `server/` directory:

```env
PORT=3001
OPENAI_API_KEY=sk-proj-xxxxx
WORDPRESS_URL=https://www.kleurplatenparadijs.nl
WORDPRESS_USERNAME=its.haroon100@gmail.com
WORDPRESS_PASSWORD=29k5 XTns BKH5 pUua v4lL oMgC
DB_PATH=./data/coloring.db
DAILY_LIMIT=50
DEFAULT_PUBLISH_HOUR=8
NODE_ENV=production
```

### 2. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Run Locally

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

Open http://localhost:3000 in your browser.

## Usage 🚀

### 1. Create Prompt
- Enter coloring page theme (e.g., "Christmas Wonderland")
- Select quantity (1-50)
- Choose style (cute, detailed, simple, fantasy, nature)
- Select default category

### 2. Generate Ideas
- AI generates unique ideas based on your theme
- Review and select which ideas to use
- Start batch generation

### 3. Review & Approve
- Preview AI-generated coloring pages
- Edit page titles and SEO metadata (auto-filled)
- Approve/reject individual pages
- Provide feedback for rejected designs

### 4. Schedule & Publish
- Approved pages automatically schedule for publishing
- Configure daily upload limits (1-50 posts/day)
- Set publish time (hour & minute)
- Pages auto-publish on schedule

## API Endpoints

### AI Generation
- `POST /api/ai/generate-ideas` - Generate creative ideas
- `POST /api/ai/create-prompt` - Start batch generation
- `GET /api/ai/prompt/:promptId` - Get prompt status & pages
- `POST /api/ai/approve-page` - Approve a page
- `POST /api/ai/reject-page` - Reject with feedback
- `POST /api/ai/generate-seo` - Auto-generate SEO content

### WordPress Publishing
- `GET /api/wordpress/approved-pages` - Get ready-to-publish pages
- `POST /api/wordpress/publish-page` - Publish individual page

### Scheduler
- `GET /api/scheduler/settings` - Get scheduler config
- `POST /api/scheduler/settings` - Update scheduler config
- `GET /api/scheduler/scheduled-posts` - View scheduled posts

## SEO Auto-Fill Fields

- **Page Title**: Auto-generated from idea (max 30 chars)
- **SEO Title**: Optimized for search (max 60 chars)
- **Meta Description**: Compelling description (max 160 chars)
- **Alt Text**: Image description for accessibility (max 125 chars)
- **Slug**: Auto-optimized URL slug
- **Category**: User-selectable category

## Database Schema

### Prompts Table
- Stores user prompts and generation status

### Generated Pages Table
- Stores AI-generated pages with images and ideas

### Approved Pages Table
- Stores approved pages with SEO metadata

### Scheduler Settings Table
- Stores daily limits and publish times

### Scheduled Posts Table
- Tracks posts awaiting publication

## Deployment (Vercel)

### Frontend Deployment
```bash
cd client
npm run build
vercel deploy
```

### Backend Deployment
```bash
cd server
npm run build
vercel deploy
```

Set environment variables in Vercel dashboard:
- `OPENAI_API_KEY`
- `WORDPRESS_URL`
- `WORDPRESS_USERNAME`
- `WORDPRESS_PASSWORD`
- `DAILY_LIMIT`
- `DEFAULT_PUBLISH_HOUR`

## WordPress Setup

1. Go to **Users → Your Profile**
2. Scroll to **Application Passwords**
3. Create a password for "Coloring Page Bot"
4. Copy the generated password to `.env`

## Costs 💰

- **DALL-E 3**: ~$0.04 per image
- **GPT-4 Vision**: ~$0.02 per request
- **No per-user costs**
- Generate 50 pages: ~$3

## Support & Troubleshooting

### API Key Issues
- Revoke exposed keys immediately at openai.com
- Use environment variables, never hardcode
- Store keys in `.env` locally only

### WordPress Connection Issues
- Verify REST API is enabled
- Check application password is correct
- Ensure WordPress user has post creation permissions

### Image Generation Failures
- Check OpenAI API quota
- Verify API key is valid
- Try regenerating ideas

## Future Enhancements 🔮

- [ ] Batch PDF download for multiple pages
- [ ] Advanced style transfer (match reference image)
- [ ] Multi-language support
- [ ] Custom watermarking
- [ ] Analytics dashboard
- [ ] User management & collaboration

---

**Created**: December 3, 2025  
**Client**: Kleurplaten Paradijs  
**Status**: ✅ Production Ready
