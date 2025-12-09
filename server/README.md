# Coloring Automation API

Backend API for AI Coloring Page Automation System

## Environment Variables

```
PORT=3001
OPENAI_API_KEY=sk-proj-xxxxx
WORDPRESS_URL=https://example.com
WORDPRESS_USERNAME=your_username
WORDPRESS_PASSWORD=your_app_password
DB_PATH=./data/coloring.db
DAILY_LIMIT=50
DEFAULT_PUBLISH_HOUR=8
NODE_ENV=production
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm run build
npm run start
```

## API Routes

All routes prefixed with `/api`

### AI Routes (`/ai`)
- `POST /generate-ideas` - Generate page ideas
- `POST /create-prompt` - Create and generate batch
- `GET /prompt/:id` - Get prompt details
- `POST /approve-page` - Approve a page
- `POST /reject-page` - Reject a page
- `POST /generate-seo` - Generate SEO content

### WordPress Routes (`/wordpress`)
- `GET /approved-pages` - List approved pages
- `POST /publish-page` - Publish to WordPress

### Scheduler Routes (`/scheduler`)
- `GET /settings` - Get scheduler config
- `POST /settings` - Update settings
- `GET /scheduled-posts` - View scheduled posts
