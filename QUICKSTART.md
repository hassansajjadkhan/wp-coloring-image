# Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (2 min)

```powershell
# Backend
cd server
npm install

# Frontend
cd ..\client
npm install
```

### Step 2: Configure Environment (1 min)

Create `server\.env`:
```env
PORT=3001
OPENAI_API_KEY=your-openai-api-key-here
WORDPRESS_URL=https://your-wordpress-site.com
WORDPRESS_USERNAME=your-username
WORDPRESS_PASSWORD=your-app-password
DB_PATH=./data/coloring.db
DAILY_LIMIT=50
DEFAULT_PUBLISH_HOUR=8
NODE_ENV=production
```

### Step 3: Run Locally (2 min)

```powershell
# Terminal 1: Start Backend
cd server
npm run dev

# Terminal 2: Start Frontend
cd client
npm run dev
```

Open http://localhost:3000 ✨

## 📋 Workflow

1. **Create Prompt** → Enter theme, quantity, style
2. **Generate Ideas** → AI creates unique ideas
3. **Review Pages** → Approve/reject with feedback
4. **Configure Scheduler** → Set daily limits & time
5. **Auto-Publish** → WordPress gets posts daily

## 🎯 Key Features

✅ AI generates unique coloring pages  
✅ Auto-fills SEO metadata  
✅ Direct WordPress publishing  
✅ Daily automatic scheduling  
✅ Review & approval dashboard  
✅ PDF generation for downloads

## 🔧 Commands

```bash
# Backend
npm run dev          # Development mode
npm run build        # Build for production
npm run start        # Run production build

# Frontend
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview build
```

## ⚙️ Configuration

### Adjust Daily Posts
Go to "Scheduler" tab → Change "Daily Post Limit"

### Change Publish Time
Go to "Scheduler" tab → Select time

### Create New Coloring Pages
Go to "Prompt" tab → Enter new theme

## 📞 Support

For issues with:
- **OpenAI API**: Check API key & quota at openai.com
- **WordPress**: Verify REST API & app password
- **Database**: Check `./data/coloring.db` exists

---

**Ready to generate!** 🎨
